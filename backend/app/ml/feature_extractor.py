import numpy as np
from typing import List, Dict, Any


class FeatureExtractor:
    """
    Extracts high-dimensional statistical and physical cross-sensor features
    from a window of industrial sensor readings.
    """

    FEATURE_NAMES = [
        "vib_rms_mean",
        "vib_rms_std",
        "vib_peak_max",
        "vib_kurtosis_mean",
        "vib_crest_factor",
        "temp_mean",
        "temp_slope",
        "current_mean",
        "current_var",
        "current_peak_to_peak",
        "speed_mean",
        "speed_cov",
        "pressure_mean",
        "pressure_var",
        "load_mean",
        "vib_to_temp_ratio",
        "current_to_load_ratio",
        "physical_friction_consistency"
    ]

    def extract_features(self, window: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extract features from a window of sensor readings.
        If window is small (e.g. 1 point), fallback gracefully.
        """
        if not window:
            return {k: 0.0 for k in self.FEATURE_NAMES}

        vib_rms = np.array([pt["vibration_rms"] for pt in window], dtype=float)
        vib_peak = np.array([pt["vibration_peak"] for pt in window], dtype=float)
        vib_kurt = np.array([pt.get("vibration_kurtosis", 3.0) for pt in window], dtype=float)
        temp = np.array([pt["temperature"] for pt in window], dtype=float)
        curr = np.array([pt["motor_current"] for pt in window], dtype=float)
        speed = np.array([pt["rotational_speed"] for pt in window], dtype=float)
        press = np.array([pt["pressure"] for pt in window], dtype=float)
        load = np.array([pt["load_pct"] for pt in window], dtype=float)

        n = len(window)

        # 1. Vibration metrics
        vib_rms_mean = float(np.mean(vib_rms))
        vib_rms_std = float(np.std(vib_rms)) if n > 1 else 0.0
        vib_peak_max = float(np.max(vib_peak))
        vib_kurt_mean = float(np.mean(vib_kurt))
        vib_crest_factor = float(vib_peak_max / max(0.01, vib_rms_mean))

        # 2. Temperature metrics
        temp_mean = float(np.mean(temp))
        if n >= 5:
            # Linear slope (°C per step)
            x = np.arange(n)
            slope, _ = np.polyfit(x, temp, 1)
            temp_slope = float(slope)
        else:
            temp_slope = float(temp[-1] - temp[0]) if n > 1 else 0.0

        # 3. Motor Current metrics
        current_mean = float(np.mean(curr))
        current_var = float(np.var(curr)) if n > 1 else 0.0
        current_p2p = float(np.max(curr) - np.min(curr)) if n > 1 else 0.0

        # 4. Speed stability
        speed_mean = float(np.mean(speed))
        speed_cov = float(np.std(speed) / max(1.0, speed_mean)) if n > 1 else 0.0

        # 5. Pressure metrics
        pressure_mean = float(np.mean(press))
        pressure_var = float(np.var(press)) if n > 1 else 0.0

        # 6. Load
        load_mean = float(np.mean(load))

        # 7. Cross-Sensor Physical Signatures
        # Mechanical friction usually scales vibration with casing heat
        vib_to_temp_ratio = float((vib_rms_mean * 10.0) / max(10.0, temp_mean))
        current_to_load_ratio = float(current_mean / max(1.0, load_mean))

        # Physical consistency metric: If vibration > 4 mm/s, temperature SHOULD rise (>55°C).
        # If vibration is high but temp is <=48°C, consistency drops near 0!
        if vib_rms_mean > 3.5:
            expected_temp_min = 48.0 + (vib_rms_mean - 3.5) * 4.0
            actual_temp = temp_mean
            if actual_temp < expected_temp_min:
                # Contradiction detected
                deficit = expected_temp_min - actual_temp
                physical_friction_consistency = float(max(0.0, 1.0 - (deficit / 15.0)))
            else:
                physical_friction_consistency = 1.0
        else:
            physical_friction_consistency = 1.0

        features = {
            "vib_rms_mean": round(vib_rms_mean, 4),
            "vib_rms_std": round(vib_rms_std, 4),
            "vib_peak_max": round(vib_peak_max, 4),
            "vib_kurtosis_mean": round(vib_kurt_mean, 4),
            "vib_crest_factor": round(vib_crest_factor, 4),
            "temp_mean": round(temp_mean, 4),
            "temp_slope": round(temp_slope, 4),
            "current_mean": round(current_mean, 4),
            "current_var": round(current_var, 4),
            "current_peak_to_peak": round(current_p2p, 4),
            "speed_mean": round(speed_mean, 4),
            "speed_cov": round(speed_cov, 6),
            "pressure_mean": round(pressure_mean, 4),
            "pressure_var": round(pressure_var, 4),
            "load_mean": round(load_mean, 4),
            "vib_to_temp_ratio": round(vib_to_temp_ratio, 4),
            "current_to_load_ratio": round(current_to_load_ratio, 4),
            "physical_friction_consistency": round(physical_friction_consistency, 4)
        }
        return features

    def to_vector(self, features: Dict[str, float]) -> np.ndarray:
        """Convert dictionary to ordered numpy feature vector."""
        return np.array([features.get(name, 0.0) for name in self.FEATURE_NAMES], dtype=float)


feature_extractor = FeatureExtractor()
