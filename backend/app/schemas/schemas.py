from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class SensorReadingSchema(BaseModel):
    timestamp: str
    vibration_rms: float        # mm/s
    vibration_peak: float       # g
    vibration_kurtosis: float    # kurtosis
    temperature: float          # °C
    motor_current: float        # A
    rotational_speed: float     # RPM
    pressure: float             # bar
    load_pct: float             # %
    scenario: str


class MachineSchema(BaseModel):
    id: str
    name: str
    machine_type: str
    location: str
    rated_rpm: float
    rated_power_kw: float
    bearing_type: str
    last_service_date: str
    last_service_notes: str
    status: str


class EvidenceItemSchema(BaseModel):
    evidence_type: str          # SUPPORTING, CONTRADICTORY, UNKNOWN_FACTOR
    description: str
    metric_name: Optional[str] = None
    observed_value: Optional[str] = None
    expected_value: Optional[str] = None
    severity: str = "MEDIUM"


class ExplanationSchema(BaseModel):
    what_happened: str
    ai_hypothesis: str
    why_ai_thinks_this: str
    evidence_supports: List[str]
    evidence_contradicts: List[str]
    pattern_familiarity: str
    what_ai_does_not_know: str
    recommended_action: str
    refusal_statement: Optional[str] = None


class KnowledgeItemSchema(BaseModel):
    document_code: str
    title: str
    section: str
    guidance: str
    relevance_score: float
    category: str


class IncidentDetailSchema(BaseModel):
    id: str
    machine_id: str
    timestamp: str
    status: str                 # NORMAL, KNOWN_FAULT, UNKNOWN_FAILURE_PATTERN
    predicted_diagnosis: Optional[str]
    known_probability: float
    unknown_probability: float
    anomaly_score: float
    novelty_score: float
    confidence_score: float
    trust_level: str            # HIGH_TRUST, MEDIUM_TRUST, LOW_TRUST, UNKNOWN
    refused_confident_diagnosis: bool
    human_verification_required: bool
    evidences: List[EvidenceItemSchema]
    knowledge_items: List[KnowledgeItemSchema]
    explanation: ExplanationSchema
    decision: Optional[Dict[str, Any]] = None


class SimulateRequest(BaseModel):
    scenario: str = Field(..., description="normal, bearing_fault, motor_overheat, imbalance, misalignment, unknown_failure")
    machine_id: str = "MOTOR-04"
    duration_points: int = 40


class HumanDecisionRequest(BaseModel):
    action: str = Field(..., description="CONFIRM, REJECT, MARK_UNKNOWN, REQUEST_EVIDENCE")
    reason: str = Field(..., description="Sensor issue, Recent maintenance, Environmental condition, Operating condition changed, AI missed contextual information, Unknown failure, Other")
    notes: Optional[str] = ""
    operator_id: str = "ENG-402 (Lead Reliability Eng)"


class FeedbackStatsResponse(BaseModel):
    total_incidents: int
    total_decisions: int
    confirmations: int
    rejections: int
    unknown_marked: int
    request_evidence: int
    ai_human_agreement_rate: float
    override_reasons: Dict[str, int]
    staged_retraining_samples: int
    recent_history: List[Dict[str, Any]]


class TimelineEvent(BaseModel):
    timestamp: str
    title: str
    description: str
    stage: str                  # SENSOR, ML_INFERENCE, NOVELTY, CONTRADICTION, ESCALATION, HUMAN_ACTION, FEEDBACK
    status: str                 # INFO, WARNING, CRITICAL, SUCCESS
