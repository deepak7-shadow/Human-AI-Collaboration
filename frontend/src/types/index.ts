export interface SensorReading {
  timestamp: string;
  vibration_rms: number;
  vibration_peak: number;
  vibration_kurtosis: number;
  temperature: number;
  motor_current: number;
  rotational_speed: number;
  pressure: number;
  load_pct: number;
  scenario: string;
}

export interface Machine {
  id: string;
  name: string;
  machine_type: string;
  location: string;
  rated_rpm: number;
  rated_power_kw: number;
  bearing_type: string;
  last_service_date: string;
  last_service_notes: string;
  status: string;
}

export interface EvidenceItem {
  evidence_type: 'SUPPORTING' | 'CONTRADICTORY' | 'UNKNOWN_FACTOR';
  description: string;
  metric_name?: string;
  observed_value?: string;
  expected_value?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface KnowledgeItem {
  document_code: string;
  title: string;
  section: string;
  guidance: string;
  relevance_score: number;
  category: string;
}

export interface Explanation {
  what_happened: string;
  ai_hypothesis: string;
  why_ai_thinks_this: string;
  evidence_supports: string[];
  evidence_contradicts: string[];
  pattern_familiarity: string;
  what_ai_does_not_know: string;
  recommended_action: string;
  refusal_statement?: string | null;
}

export interface HumanDecisionRecord {
  action: 'CONFIRM' | 'REJECT' | 'MARK_UNKNOWN' | 'REQUEST_EVIDENCE';
  reason: string;
  notes?: string;
  operator_id: string;
  timestamp: string;
  final_diagnosis?: string;
}

export interface IncidentDetail {
  id: string;
  machine_id: string;
  timestamp: string;
  status: 'NORMAL' | 'KNOWN_FAULT' | 'UNKNOWN_FAILURE_PATTERN';
  predicted_diagnosis: string;
  known_probability: number;
  unknown_probability: number;
  anomaly_score: number;
  novelty_score: number;
  confidence_score: number;
  trust_level: 'HIGH_TRUST' | 'MEDIUM_TRUST' | 'LOW_TRUST' | 'UNKNOWN';
  refused_confident_diagnosis: boolean;
  human_verification_required: boolean;
  evidences: EvidenceItem[];
  knowledge_items: KnowledgeItem[];
  explanation: Explanation;
  decision?: HumanDecisionRecord | null;
}

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  stage: 'SENSOR' | 'ML_INFERENCE' | 'NOVELTY' | 'CONTRADICTION' | 'ESCALATION' | 'HUMAN_ACTION' | 'FEEDBACK';
  status: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface FeedbackStats {
  total_incidents: number;
  total_decisions: number;
  confirmations: number;
  rejections: number;
  unknown_marked: number;
  request_evidence: number;
  ai_human_agreement_rate: number;
  override_reasons: Record<string, number>;
  staged_retraining_samples: number;
  recent_history: Array<{
    incident_id: string;
    action: string;
    reason: string;
    notes?: string;
    timestamp: string;
    operator_id: string;
  }>;
}
