import numpy as np
from typing import Dict, Any


class UncertaintyEngine:
    """
    Dedicated Uncertainty & Trust Engine for UNKNOWN-X.
    Evaluates whether the AI actually understands the failure or is blindly guessing.

    Generates:
    - known_probability: Probability assigned to known fault classes
    - unknown_probability: Probability that the condition is an unmodeled/unseen failure
    - anomaly_score: Prototype-derived outlier severity (0.0 to 1.0)
    - novelty_score: Prototype-derived distance from known training distributions (0.0 to 1.0)
    - confidence_score: Calibrated reliability of the diagnosis
    - trust_level: HIGH_TRUST | MEDIUM_TRUST | LOW_TRUST | UNKNOWN
    - refused_confident_diagnosis: Boolean flag enforcing refusal policy
    """

    # Empirical decision boundaries
    NOVELTY_UNKNOWN_THRESHOLD = 0.55
    CONTRADICTION_THRESHOLD = 0.50
    CONFIDENCE_MIN_THRESHOLD = 0.60

    def evaluate_uncertainty(
        self,
        classifier_output: Dict[str, Any],
        novelty_output: Dict[str, Any],
        contradiction_output: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Aggregate classifier output, novelty metrics, and contradiction signals
        to determine the final trust level and refusal trigger.
        """
        top_prob = classifier_output["top_probability"]
        pred_class = classifier_output["predicted_class"]
        entropy = classifier_output["entropy"]
        margin = classifier_output["margin"]

        anomaly_score = novelty_output["anomaly_score"]
        novelty_score = novelty_output["novelty_score"]
        distance_score = novelty_output["distance_score"]
        physical_consistency = novelty_output["physical_consistency"]

        contradiction_score = contradiction_output.get("contradiction_score", 0.0)
        has_critical_contradiction = contradiction_output.get("has_critical_contradiction", False)

        # 1. Compute Unknown Probability
        # Increases when novelty is high, entropy is high, or physical contradiction is strong
        raw_unknown = (
            0.50 * novelty_score +
            0.25 * (1.0 - top_prob) +
            0.15 * contradiction_score +
            0.10 * entropy
        )
        unknown_probability = float(np.clip(raw_unknown, 0.0, 1.0))

        # Known probability is the probability that the event is within the known domain
        # Calibrated by novelty: if novelty is high, top_prob is discounted!
        known_probability = float(np.clip(top_prob * (1.0 - (0.85 * novelty_score)), 0.0, 1.0))

        # Ensure probabilities are coherent
        total_p = known_probability + unknown_probability
        if total_p > 0:
            norm_known = known_probability / total_p
            norm_unknown = unknown_probability / total_p
        else:
            norm_known = 0.5
            norm_unknown = 0.5

        # 2. Compute Calibrated Confidence Score
        # Drops precipitously if there are contradictions or high novelty
        calibrated_confidence = float(np.clip(
            top_prob * (1.0 - novelty_score) * (1.0 - 0.7 * contradiction_score),
            0.0, 1.0
        ))

        # 3. Determine Trust State & Refusal Policy
        # Refusal condition:
        # If the failure is sufficiently novel (unfamiliar) OR
        # anomaly is high and contradictions conflict with the top prediction,
        # the AI MUST refuse to make an unsupported confident diagnosis!
        is_unknown = (
            novelty_score >= self.NOVELTY_UNKNOWN_THRESHOLD or
            (novelty_score >= 0.35 and contradiction_score >= self.CONTRADICTION_THRESHOLD) or
            (novelty_score >= 0.35 and anomaly_score > 0.70 and top_prob < 0.50)
        )

        refused_confident_diagnosis = False
        human_verification_required = False

        if pred_class == "NORMAL" and anomaly_score < 0.35 and novelty_score < 0.30:
            trust_level = "HIGH_TRUST"
            status = "NORMAL"
            human_verification_required = False

        elif is_unknown:
            trust_level = "UNKNOWN"
            status = "UNKNOWN_FAILURE_PATTERN"
            refused_confident_diagnosis = True
            human_verification_required = True

        elif contradiction_score > 0.40 or has_critical_contradiction or calibrated_confidence < 0.45:
            trust_level = "LOW_TRUST"
            status = "KNOWN_FAULT"
            human_verification_required = True

        elif calibrated_confidence < 0.70 or margin < 0.30:
            trust_level = "MEDIUM_TRUST"
            status = "KNOWN_FAULT"
            human_verification_required = True

        else:
            trust_level = "HIGH_TRUST"
            status = "KNOWN_FAULT"
            human_verification_required = False

        return {
            "status": status,
            "trust_level": trust_level,
            "known_probability": round(norm_known, 3),
            "unknown_probability": round(norm_unknown, 3),
            "anomaly_score": round(anomaly_score, 3),
            "novelty_score": round(novelty_score, 3),
            "confidence_score": round(calibrated_confidence, 3),
            "contradiction_score": round(contradiction_score, 3),
            "refused_confident_diagnosis": refused_confident_diagnosis,
            "human_verification_required": human_verification_required,
            "metrics_disclaimer": "Scores derived from multi-signal empirical uncertainty engine (Isolation Forest, Mahalanobis Distance, & Cross-Sensor Physics)."
        }


uncertainty_engine = UncertaintyEngine()
