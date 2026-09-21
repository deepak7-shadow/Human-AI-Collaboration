from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"


def test_machines_endpoint():
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert len(machines) >= 1
    assert machines[0]["id"] == "MOTOR-04"


def test_simulate_and_analyze_known_fault():
    # Simulate known bearing fault
    res = client.post("/api/simulate", json={"scenario": "bearing_fault", "machine_id": "MOTOR-04"})
    assert res.status_code == 200
    payload = res.json()
    assert payload["status"] == "success"
    analysis = payload["analysis"]
    assert "known_probability" in analysis
    assert analysis["status"] in ["KNOWN_FAULT", "NORMAL"]


def test_simulate_and_analyze_unknown_failure():
    # Simulate genuine unknown failure
    res = client.post("/api/simulate", json={"scenario": "unknown_failure", "machine_id": "MOTOR-04"})
    assert res.status_code == 200
    payload = res.json()
    analysis = payload["analysis"]
    
    # Must detect unknown failure pattern and refuse confident diagnosis
    assert analysis["status"] == "UNKNOWN_FAILURE_PATTERN"
    assert analysis["trust_level"] == "UNKNOWN"
    assert analysis["refused_confident_diagnosis"] is True
    assert analysis["human_verification_required"] is True
    assert len(analysis["evidences"]) > 0

    incident_id = analysis["id"]

    # Human expert submits decision: MARK_UNKNOWN
    dec_res = client.post(
        f"/api/incidents/{incident_id}/human-decision",
        json={
            "action": "MARK_UNKNOWN",
            "reason": "Unknown failure",
            "notes": "Severe vibration observed without casing heating. Inconsistent with standard bearing spalling.",
            "operator_id": "ENG-402 (Lead Reliability Eng)"
        }
    )
    assert dec_res.status_code == 200
    dec_data = dec_res.json()
    assert dec_data["status"] == "success"
    assert dec_data["action"] == "MARK_UNKNOWN"

    # Verify timeline contains all stages
    timeline_res = client.get(f"/api/timeline/{incident_id}")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 5
    assert any("Sensor Anomaly" in event["title"] for event in timeline)
    assert any("Human Expert Decision" in event["title"] for event in timeline)

    # Verify feedback stats updated
    stats_res = client.get("/api/feedback/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_decisions"] >= 1
