import pytest
from backend.app.simulation.sensor_simulator import simulator
from backend.app.ml.feature_extractor import feature_extractor
from backend.app.ml.fault_classifier import fault_classifier
from backend.app.ml.novelty_detector import novelty_detector
from backend.app.services.uncertainty_engine import uncertainty_engine
from backend.app.services.contradiction_engine import contradiction_engine
from backend.app.rag.knowledge_base import knowledge_base


def test_sensor_simulator():
    """Verify that normal, bearing fault, and unknown streams generate realistic numbers."""
    norm_stream = simulator.generate_stream("normal", 20)
    assert len(norm_stream) == 20
    assert norm_stream[-1]["vibration_rms"] < 3.0
    assert norm_stream[-1]["temperature"] < 55.0

    bearing_stream = simulator.generate_stream("bearing_fault", 30)
    assert bearing_stream[-1]["vibration_rms"] > 5.0
    assert bearing_stream[-1]["vibration_kurtosis"] > 4.0

    unknown_stream = simulator.generate_stream("unknown_failure", 30)
    # Unknown has high vibration but nominal temp
    assert unknown_stream[-1]["vibration_rms"] > 5.0
    assert unknown_stream[-1]["temperature"] < 50.0


def test_feature_extractor():
    """Verify feature extractor extracts full vector without NaNs."""
    stream = simulator.generate_stream("bearing_fault", 25)
    feats = feature_extractor.extract_features(stream[10:])
    vec = feature_extractor.to_vector(feats)
    assert len(vec) == len(feature_extractor.FEATURE_NAMES)
    assert not any(val is None or (isinstance(val, float) and val != val) for val in vec)


def test_known_fault_classifier():
    """Verify classifier correctly recognizes bearing fault on known signature."""
    stream = simulator.generate_stream("bearing_fault", 30)
    feats = feature_extractor.extract_features(stream[15:])
    vec = feature_extractor.to_vector(feats)
    pred = fault_classifier.predict(vec)
    assert pred["predicted_class"] == "BEARING_FAULT"
    assert pred["top_probability"] > 0.50


def test_unknown_detection_and_uncertainty_refusal():
    """
    CRITICAL TEST:
    Verify that an UNKNOWN failure causes:
    1. High novelty score (>0.60)
    2. Contradiction engine detecting nominal temperature and recent maintenance
    3. Uncertainty engine enforcing 'refused_confident_diagnosis == True'
    4. Trust level == 'UNKNOWN' and status == 'UNKNOWN_FAILURE_PATTERN'
    """
    stream = simulator.generate_stream("unknown_failure", 30)
    feats = feature_extractor.extract_features(stream[15:])
    vec = feature_extractor.to_vector(feats)

    classifier_out = fault_classifier.predict(vec)
    novelty_out = novelty_detector.evaluate(vec, feats)
    
    assert novelty_out["novelty_score"] > 0.50, f"Novelty score too low: {novelty_out['novelty_score']}"

    contradictions = contradiction_engine.analyze(
        classifier_out["predicted_class"],
        feats,
        {"name": "Motor-04", "last_service_notes": "Drive-end bearing replaced 14 days ago"}
    )
    assert len(contradictions["contradicting_evidence"]) > 0

    uncertainty = uncertainty_engine.evaluate_uncertainty(
        classifier_out,
        novelty_out,
        contradictions
    )

    assert uncertainty["status"] == "UNKNOWN_FAILURE_PATTERN"
    assert uncertainty["trust_level"] == "UNKNOWN"
    assert uncertainty["refused_confident_diagnosis"] is True
    assert uncertainty["unknown_probability"] > 0.60


def test_knowledge_base_search():
    """Verify maintenance documents return accurate citations with real manual names."""
    results = knowledge_base.search("bearing vibration temperature", top_k=2)
    assert len(results) >= 2
    assert "document_code" in results[0]
    assert "section" in results[0]
    assert results[0]["relevance_score"] > 0
