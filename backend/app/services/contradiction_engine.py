from typing import Dict, Any, List


class ContradictionEngine:
    """
    Identifies evidence supporting and CONTRADICTING candidate fault hypotheses.
    Bridges physical sensor laws, operational thresholds, and historical maintenance context.
    """

    def analyze(
        self,
        predicted_class: str,
        features: Dict[str, float],
        machine_meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze features against the candidate diagnosis and asset history.
        Returns:
        - supporting_evidence: List of verified symptoms
        - contradicting_evidence: List of conflicting signals / physics violations
        - unknown_factors: Unmodeled or ambiguous dynamics
        - contradiction_score: 0.0 to 1.0 (magnitude of conflict)
        - has_critical_contradiction: bool
        """
        supporting: List[Dict[str, Any]] = []
        contradicting: List[Dict[str, Any]] = []
        unknown_factors: List[Dict[str, Any]] = []

        vib_rms = features.get("vib_rms_mean", 1.8)
        vib_kurt = features.get("vib_kurtosis_mean", 3.0)
        temp = features.get("temp_mean", 48.0)
        curr_mean = features.get("current_mean", 42.0)
        curr_var = features.get("current_var", 0.1)
        speed = features.get("speed_mean", 1780.0)
        speed_cov = features.get("speed_cov", 0.0)
        pressure_mean = features.get("pressure_mean", 5.2)
        load_mean = features.get("load_mean", 75.0)
        friction_cons = features.get("physical_friction_consistency", 1.0)

        last_service_notes = machine_meta.get("last_service_notes", "Drive-end bearing replaced & balanced (WO-8821)")

        if predicted_class == "NORMAL":
            if vib_rms < 2.5:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": "Vibration RMS within ISO 10816-3 Zone A (nominal < 2.3 mm/s)",
                    "metric_name": "vibration_rms",
                    "observed_value": f"{vib_rms:.2f} mm/s",
                    "expected_value": "< 2.5 mm/s",
                    "severity": "LOW"
                })
            if temp < 55.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": "Stator casing and bearing temperatures nominal (< 55°C)",
                    "metric_name": "temperature",
                    "observed_value": f"{temp:.1f} °C",
                    "expected_value": "< 60.0 °C",
                    "severity": "LOW"
                })
            if curr_var < 1.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": "Motor current draw steady with low variance",
                    "metric_name": "current_var",
                    "observed_value": f"{curr_var:.2f} A²",
                    "expected_value": "< 1.5 A²",
                    "severity": "LOW"
                })

        elif predicted_class == "BEARING_FAULT":
            # Expected: High vibration RMS + High Kurtosis + Elevated Temp (>58°C) + Stable Current
            if vib_rms > 3.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": f"Vibration RMS elevated (+{((vib_rms - 1.85)/1.85)*100:.0f}% above baseline)",
                    "metric_name": "vibration_rms",
                    "observed_value": f"{vib_rms:.2f} mm/s",
                    "expected_value": "> 3.0 mm/s",
                    "severity": "HIGH"
                })
            if vib_kurt > 3.8:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": f"Impulsive kurtosis elevated to {vib_kurt:.2f} (characteristic of raceway pitting/impacts)",
                    "metric_name": "vibration_kurtosis",
                    "observed_value": f"{vib_kurt:.2f}",
                    "expected_value": "> 3.5",
                    "severity": "MEDIUM"
                })

            # Contradictions
            if temp < 50.0 and vib_rms > 4.0:
                contradicting.append({
                    "evidence_type": "CONTRADICTORY",
                    "description": f"Bearing temperature remains completely nominal ({temp:.1f}°C) — contradicts mechanical friction dissipation (expected >62°C)",
                    "metric_name": "temperature",
                    "observed_value": f"{temp:.1f} °C",
                    "expected_value": "> 62.0 °C",
                    "severity": "HIGH"
                })

            if "bearing replaced" in last_service_notes.lower() and temp < 52.0 and vib_rms > 4.0:
                contradicting.append({
                    "evidence_type": "CONTRADICTORY",
                    "description": f"Recent asset maintenance history: {last_service_notes}. Early fatigue spalling statistically improbable given nominal casing temperature.",
                    "metric_name": "maintenance_history",
                    "observed_value": "Replaced 14d ago",
                    "expected_value": "> 2,000 hrs run-time",
                    "severity": "HIGH"
                })

            if curr_var > 10.0:
                contradicting.append({
                    "evidence_type": "CONTRADICTORY",
                    "description": f"Motor current displays violent fluctuations (variance {curr_var:.1f} A²); standard bearing defects do not cause large current swings",
                    "metric_name": "current_variance",
                    "observed_value": f"{curr_var:.1f} A²",
                    "expected_value": "< 2.0 A²",
                    "severity": "HIGH"
                })

        elif predicted_class == "MOTOR_OVERHEAT":
            if temp > 70.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": f"Motor casing temperature critical ({temp:.1f}°C, exceeds NEMA Class B limit)",
                    "metric_name": "temperature",
                    "observed_value": f"{temp:.1f} °C",
                    "expected_value": "> 75.0 °C",
                    "severity": "HIGH"
                })
            if curr_mean > 50.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": f"Phase current drawn exceeds rated full load amp limit ({curr_mean:.1f} A vs 42 A rated)",
                    "metric_name": "motor_current",
                    "observed_value": f"{curr_mean:.1f} A",
                    "expected_value": "> 48.0 A",
                    "severity": "HIGH"
                })

            if temp < 58.0:
                contradicting.append({
                    "evidence_type": "CONTRADICTORY",
                    "description": f"Observed temperature ({temp:.1f}°C) is well below thermal overload threshold (>75°C)",
                    "metric_name": "temperature",
                    "observed_value": f"{temp:.1f} °C",
                    "expected_value": "> 75.0 °C",
                    "severity": "HIGH"
                })

        else:
            # Imbalance / Misalignment general checks
            if vib_rms > 3.0:
                supporting.append({
                    "evidence_type": "SUPPORTING",
                    "description": f"Vibration RMS elevated ({vib_rms:.2f} mm/s)",
                    "metric_name": "vibration_rms",
                    "observed_value": f"{vib_rms:.2f} mm/s",
                    "expected_value": "> 2.8 mm/s",
                    "severity": "MEDIUM"
                })
            if curr_var > 15.0:
                contradicting.append({
                    "evidence_type": "CONTRADICTORY",
                    "description": f"Unusual electrical current surge ({curr_var:.1f} A²) incompatible with pure mechanical alignment fault",
                    "metric_name": "current_variance",
                    "observed_value": f"{curr_var:.1f} A²",
                    "expected_value": "< 3.0 A²",
                    "severity": "HIGH"
                })

        # Check for unknown / unmodeled factors
        if curr_var > 20.0 and speed_cov < 0.002:
            unknown_factors.append({
                "evidence_type": "UNKNOWN_FACTOR",
                "description": "Severe current oscillations occurring while shaft rotational speed remains rigidly constant (violates standard torque curve)",
                "metric_name": "torque_speed_coupling",
                "observed_value": "Decoupled",
                "expected_value": "Coupled",
                "severity": "HIGH"
            })

        if vib_rms > 4.5 and temp < 49.0:
            unknown_factors.append({
                "evidence_type": "UNKNOWN_FACTOR",
                "description": "High mechanical energy dissipation with zero thermodynamic heat signature",
                "metric_name": "thermodynamic_balance",
                "observed_value": "Zero ΔT",
                "expected_value": "> +15°C ΔT",
                "severity": "HIGH"
            })

        # Contradiction Score
        high_severity_contradictions = sum(1 for c in contradicting if c["severity"] == "HIGH")
        total_contradictions = len(contradicting)
        
        contradiction_score = min(1.0, (high_severity_contradictions * 0.4) + (total_contradictions * 0.2))
        has_critical_contradiction = high_severity_contradictions > 0

        return {
            "supporting_evidence": supporting,
            "contradicting_evidence": contradicting,
            "unknown_factors": unknown_factors,
            "contradiction_score": round(contradiction_score, 3),
            "has_critical_contradiction": has_critical_contradiction
        }


contradiction_engine = ContradictionEngine()
