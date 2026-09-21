import numpy as np
import scipy.stats
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any, List, Tuple
from backend.app.simulation.sensor_simulator import simulator
from backend.app.ml.feature_extractor import feature_extractor


class KnownFaultClassifier:
    """
    ML classifier trained strictly on known operational conditions:
    1. NORMAL
    2. BEARING_FAULT
    3. MOTOR_OVERHEAT
    4. IMBALANCE
    5. MISALIGNMENT

    Crucially: UNKNOWN failures are NOT part of the training set.
    The classifier outputs standard class posteriors, but is coupled
    with the novelty detector and uncertainty engine.
    """

    KNOWN_CLASSES = [
        "NORMAL",
        "BEARING_FAULT",
        "MOTOR_OVERHEAT",
        "IMBALANCE",
        "MISALIGNMENT"
    ]

    CLASS_LABELS = {
        "NORMAL": "Normal Baseline Operation",
        "BEARING_FAULT": "Drive-End Bearing Degradation",
        "MOTOR_OVERHEAT": "Motor Stator Overheating / Thermal Overload",
        "IMBALANCE": "Rotor Dynamic Unbalance",
        "MISALIGNMENT": "Shaft Angular / Parallel Misalignment"
    }

    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=60, max_depth=8, random_state=42)
        self.is_trained = False
        self.train_on_synthetic_baselines()

    def train_on_synthetic_baselines(self):
        """Train the classifier on synthetic training distributions of known failure modes."""
        X_train = []
        y_train = []

        scenario_map = {
            "normal": 0,
            "bearing_fault": 1,
            "motor_overheat": 2,
            "imbalance": 3,
            "misalignment": 4
        }

        # Generate 35 diverse sample windows for each known class
        for scenario, class_idx in scenario_map.items():
            for run_id in range(35):
                # Generate realistic window with varied noise seeds
                raw_stream = simulator.generate_stream(scenario, count=30)
                # Take window from second half where fault is developed
                window = raw_stream[15:]
                feats = feature_extractor.extract_features(window)
                vec = feature_extractor.to_vector(feats)
                X_train.append(vec)
                y_train.append(class_idx)

        X_train = np.array(X_train)
        y_train = np.array(y_train)

        self.model.fit(X_train, y_train)
        self.is_trained = True

    def predict(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """
        Run inference on feature vector.
        Returns predicted class, probabilities, entropy, and confidence margin.
        """
        if not self.is_trained:
            self.train_on_synthetic_baselines()

        X = feature_vector.reshape(1, -1)
        probs = self.model.predict_proba(X)[0]
        pred_idx = int(np.argmax(probs))
        pred_class = self.KNOWN_CLASSES[pred_idx]
        top_prob = float(probs[pred_idx])

        # Sort probabilities to compute margin
        sorted_probs = np.sort(probs)[::-1]
        margin = float(sorted_probs[0] - sorted_probs[1]) if len(sorted_probs) > 1 else 1.0

        # Shannon Entropy as a measure of classifier uncertainty
        # Normalized between 0.0 and 1.0
        entropy = float(scipy.stats.entropy(probs + 1e-12) / np.log(len(self.KNOWN_CLASSES)))

        class_probabilities = {
            self.KNOWN_CLASSES[i]: round(float(probs[i]), 4)
            for i in range(len(self.KNOWN_CLASSES))
        }

        return {
            "predicted_class": pred_class,
            "display_name": self.CLASS_LABELS.get(pred_class, pred_class),
            "top_probability": round(top_prob, 4),
            "class_probabilities": class_probabilities,
            "entropy": round(entropy, 4),
            "margin": round(margin, 4)
        }


fault_classifier = KnownFaultClassifier()
