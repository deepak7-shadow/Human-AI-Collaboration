import math
import random
import datetime
from typing import List, Dict, Any


class SensorSimulator:
    """
    Industrial sensor simulation engine for 75 kW Slurry Pump Induction Motor (MOTOR-04).
    Simulates high-precision temporal sensor streams for:
    - Normal operation
    - Bearing degradation (known fault)
    - Motor overheating (known fault)
    - Rotor imbalance (known fault)
    - Shaft misalignment (known fault)
    - UNKNOWN FAILURE (novel, synthetic OOD anomaly violating known physical signatures)
    """

    def __init__(self):
        self.random_seed = 42
        random.seed(self.random_seed)

    def generate_point(self, scenario: str, t_step: int, total_steps: int = 40) -> Dict[str, Any]:
        """
        Generate a single sensor reading snapshot at time step t_step.
        Transition smoothly into anomalies over the sequence.
        """
        progress = min(1.0, max(0.0, (t_step - 10) / float(max(1, total_steps - 10)))) if t_step >= 10 else 0.0
        now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=(total_steps - t_step) * 2)
        noise = lambda scale: random.gauss(0, scale)

        if scenario == "normal":
            vibration_rms = 1.85 + 0.15 * math.sin(t_step * 0.4) + noise(0.08)
            vibration_peak = 2.45 + noise(0.12)
            vibration_kurtosis = 2.95 + noise(0.1)
            temperature = 48.2 + 0.4 * math.sin(t_step * 0.1) + noise(0.2)
            motor_current = 42.1 + 0.5 * math.sin(t_step * 0.3) + noise(0.3)
            rotational_speed = 1782.0 + noise(2.0)
            pressure = 5.2 + 0.05 * math.sin(t_step * 0.2) + noise(0.04)
            load_pct = 74.5 + noise(0.8)

        elif scenario == "bearing_fault":
            # Known fault: Vibration surges, kurtosis jumps due to impacts, temperature rises moderately, current normal
            base_vib = 1.85 + (5.8 * progress)
            vibration_rms = base_vib + 0.4 * math.sin(t_step * 0.8) + noise(0.2)
            vibration_peak = 2.45 + (6.2 * progress) + noise(0.3)
            vibration_kurtosis = 2.95 + (3.2 * progress) + noise(0.25)
            temperature = 48.2 + (18.5 * progress) + noise(0.3)   # Reaches ~67°C
            motor_current = 42.1 + (1.5 * progress) + noise(0.4)  # Barely changes
            rotational_speed = 1782.0 - (12.0 * progress) + noise(3.0)
            pressure = 5.2 - (0.3 * progress) + noise(0.05)
            load_pct = 74.5 + noise(1.0)

        elif scenario == "motor_overheat":
            # Known fault: Stator insulation/cooling fault: Temp spikes >90°C, high phase current, vibration normal
            vibration_rms = 1.85 + (0.3 * progress) + noise(0.09)
            vibration_peak = 2.45 + (0.4 * progress) + noise(0.12)
            vibration_kurtosis = 2.95 + noise(0.1)
            temperature = 48.2 + (46.0 * progress) + noise(0.4)   # Reaches ~95°C!
            motor_current = 42.1 + (18.2 * progress) + noise(0.6) # Reaches ~60A
            rotational_speed = 1782.0 - (28.0 * progress) + noise(4.0) # Thermal slip
            pressure = 5.2 - (0.4 * progress) + noise(0.06)
            load_pct = 74.5 + (4.0 * progress) + noise(1.2)

        elif scenario == "imbalance":
            # Known fault: 1X vibration dominance, proportional to speed, mild current ripple
            vibration_rms = 1.85 + (4.2 * progress) + noise(0.15)
            vibration_peak = 2.45 + (3.8 * progress) + noise(0.2)
            vibration_kurtosis = 3.05 + noise(0.15)
            temperature = 51.0 + (5.0 * progress) + noise(0.3)
            motor_current = 42.1 + (3.0 * progress * math.sin(t_step * 1.2)) + noise(0.4)
            rotational_speed = 1782.0 - (8.0 * progress) + noise(2.5)
            pressure = 5.2 + noise(0.05)
            load_pct = 75.0 + noise(1.0)

        elif scenario == "misalignment":
            # Known fault: 2X vibration harmonics, axial stress, moderate temperature rise at coupling
            vibration_rms = 1.85 + (3.6 * progress) + noise(0.18)
            vibration_peak = 2.45 + (4.1 * progress) + noise(0.22)
            vibration_kurtosis = 3.3 + (1.2 * progress) + noise(0.15)
            temperature = 48.2 + (12.0 * progress) + noise(0.3)
            motor_current = 42.1 + (4.5 * progress) + noise(0.4)
            rotational_speed = 1780.0 - (10.0 * progress) + noise(2.0)
            pressure = 5.2 + noise(0.05)
            load_pct = 76.0 + noise(1.1)

        elif scenario == "unknown_failure":
            # GENUINE UNKNOWN FAILURE:
            # 1. Chaotic, ultra-high vibration spike (6.9 mm/s, high crest)
            # 2. Inconsistent temperature: remains completely nominal (~46.4°C)
            #    (Direct contradiction with physical bearing friction!)
            # 3. Erratic motor current oscillation (swings between 30A and 64A)
            #    while rotational speed stays rigidly locked at 1782 RPM
            #    (Violates standard torque-speed-current curve)
            # 4. Discharge pressure experiences rapid phase inversion with load
            # This combination NEVER occurs in training data.
            vib_chaos = math.sin(t_step * 1.7) * math.cos(t_step * 2.3)
            vibration_rms = 1.85 + (5.1 * progress) + (1.4 * progress * vib_chaos) + noise(0.25)
            vibration_peak = 2.45 + (7.2 * progress) + noise(0.4)
            vibration_kurtosis = 2.95 + (4.8 * progress * abs(vib_chaos)) + noise(0.3)
            
            # Physics contradiction: Temp stays cool or even drops slightly due to cooling water flush
            temperature = 48.2 - (2.1 * progress) + noise(0.2)
            
            # Erratic phase oscillation in current without speed drop
            current_osc = 16.0 * progress * math.sin(t_step * 1.5)
            motor_current = 42.1 + current_osc + noise(0.8)
            rotational_speed = 1782.0 + noise(1.2) # Rigidly locked!
            
            # Inverted pressure / load fluctuations
            pressure = 5.2 + (1.8 * progress * math.sin(t_step * 0.9)) + noise(0.1)
            load_pct = 74.5 - (12.0 * progress * math.sin(t_step * 0.9)) + noise(1.5)

        else:
            # Default fallback to normal
            vibration_rms = 1.85 + noise(0.08)
            vibration_peak = 2.45 + noise(0.12)
            vibration_kurtosis = 2.95 + noise(0.1)
            temperature = 48.2 + noise(0.2)
            motor_current = 42.1 + noise(0.3)
            rotational_speed = 1782.0 + noise(2.0)
            pressure = 5.2 + noise(0.04)
            load_pct = 74.5 + noise(0.8)

        return {
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
            "vibration_rms": round(max(0.1, vibration_rms), 3),
            "vibration_peak": round(max(0.1, vibration_peak), 3),
            "vibration_kurtosis": round(max(1.0, vibration_kurtosis), 3),
            "temperature": round(max(10.0, temperature), 2),
            "motor_current": round(max(0.0, motor_current), 2),
            "rotational_speed": round(max(0.0, rotational_speed), 1),
            "pressure": round(max(0.0, pressure), 3),
            "load_pct": round(max(0.0, min(100.0, load_pct)), 2),
            "scenario": scenario
        }

    def generate_stream(self, scenario: str, count: int = 40) -> List[Dict[str, Any]]:
        """Generate a complete chronological timeseries stream."""
        return [self.generate_point(scenario, i, total_steps=count) for i in range(1, count + 1)]


simulator = SensorSimulator()
