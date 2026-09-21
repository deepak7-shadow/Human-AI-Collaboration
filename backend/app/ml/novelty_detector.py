import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List
from backend.app.simulation.sensor_simulator import simulator
from backend.app.ml.feature_extractor import feature_extractor


class NoveltyDetector:
    """
    Multi-signal Out-of-Distribution (OOD) & Novelty Detection Engine.
    Combines:
    1. Isolation Forest Anomaly Intensity
    2. Scaled Euclidean Distance to Known Training Class Centroids (using StandardScaler)
    3. Cross-Sensor Physical Law Consistency
    """

    def __init__(self):
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.04,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.class_centroids: Dict[str, np.ndarray] = {}
        self.is_fitted = False
        self.fit_on_known_baselines()

    def fit_on_known_baselines(self):
        """Fit Isolation Forest and calculate class centroids on known operating modes."""
        known_scenarios = ["normal", "bearing_fault", "motor_overheat", "imbalance", "misalignment"]
        all_vectors = []

        for sc in known_scenarios:
            class_vecs = []
            for _ in range(40):
                raw_stream = simulator.generate_stream(sc, count=40)
                window = raw_stream[18:]
                feats = feature_extractor.extract_features(window)
                vec = feature_extractor.to_vector(feats)
                class_vecs.append(vec)
                all_vectors.append(vec)

            self.class_centroids[sc] = np.mean(class_vecs, axis=0)

        all_vectors = np.array(all_vectors)
        self.scaler.fit(all_vectors)
        self.iso_forest.fit(all_vectors)
        self.is_fitted = True

    def evaluate(self, feature_vector: np.ndarray, raw_features: Dict[str, float]) -> Dict[str, float]:
        """
        Evaluate how novel/unfamiliar the observation is compared to all known classes.
        Returns:
        - anomaly_score: 0.0 (normal) to 1.0 (highly anomalous)
        - min_centroid_distance: normalized distance to closest known class
        - novelty_score: 0.0 (familiar) to 1.0 (completely unfamiliar/novel)
        - physical_consistency: 0.0 (physics violated) to 1.0 (physics consistent)
        """
        if not self.is_fitted:
            self.fit_on_known_baselines()

        X = feature_vector.reshape(1, -1)
        X_scaled = self.scaler.transform(X)[0]

        # 1. Isolation Forest Anomaly Score
        raw_score = self.iso_forest.decision_function(X)[0]
        # Map to 0.0 (inlier) -> 1.0 (strong anomaly)
        anomaly_score = float(np.clip(1.0 / (1.0 + np.exp(raw_score * 12.0)), 0.0, 1.0))

        # 2. Scaled Euclidean Distance to Known Class Centroids
        min_dist = float("inf")
        closest_class = None

        for sc, centroid in self.class_centroids.items():
            c_scaled = self.scaler.transform(centroid.reshape(1, -1))[0]
            dist = float(np.linalg.norm(X_scaled - c_scaled))
            if dist < min_dist:
                min_dist = dist
                closest_class = sc

        # Distance score: known classes are <= 3.5, unknown is typically > 10.0
        # Map [2.0, 8.0] linearly to [0.0, 1.0]
        distance_score = float(np.clip((min_dist - 2.5) / 5.5, 0.0, 1.0))

        # 3. Cross-Sensor Physical Consistency
        physical_consistency = float(raw_features.get("physical_friction_consistency", 1.0))
        physics_inconsistency_score = 1.0 - physical_consistency

        # 4. Composite Novelty Score
        # Known classes will have distance_score ~ 0.0, physical_inconsistency ~ 0.0 -> novelty < 0.25
        # Unknown failure will have distance_score ~ 1.0, physical_inconsistency ~ 1.0 -> novelty > 0.85
        novelty_score = float(np.clip(
            0.50 * distance_score + 0.30 * anomaly_score + 0.20 * physics_inconsistency_score,
            0.0, 1.0
        ))

        return {
            "anomaly_score": round(anomaly_score, 4),
            "min_centroid_distance": round(min_dist, 4),
            "distance_score": round(distance_score, 4),
            "novelty_score": round(novelty_score, 4),
            "physical_consistency": round(physical_consistency, 4),
            "closest_known_class": closest_class
        }


novelty_detector = NoveltyDetector()
