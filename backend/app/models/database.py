import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./unknown_x.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    machine_type = Column(String, nullable=False)
    location = Column(String, default="Bay 4 - Processing Line")
    rated_rpm = Column(Float, default=1800.0)
    rated_power_kw = Column(Float, default=75.0)
    bearing_type = Column(String, default="SKF 6210-2Z Deep Groove Ball Bearing")
    last_service_date = Column(String, default="14 days ago")
    last_service_notes = Column(String, default="Drive-end bearing replaced & balanced (WO-8821)")
    status = Column(String, default="NORMAL")  # NORMAL, WARNING, CRITICAL, UNKNOWN

    incidents = relationship("Incident", back_populates="machine")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String, ForeignKey("machines.id"), index=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    vibration_rms = Column(Float, nullable=False)       # mm/s
    vibration_peak = Column(Float, nullable=False)      # g
    vibration_kurtosis = Column(Float, default=3.0)     # dimensionless
    temperature = Column(Float, nullable=False)         # °C
    motor_current = Column(Float, nullable=False)       # A
    rotational_speed = Column(Float, nullable=False)    # RPM
    pressure = Column(Float, nullable=False)            # bar
    load_pct = Column(Float, nullable=False)            # %
    scenario = Column(String, default="normal")         # normal, bearing_fault, motor_overheat, etc.


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)   # INC-XXXX
    machine_id = Column(String, ForeignKey("machines.id"), index=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    status = Column(String, nullable=False)             # NORMAL, KNOWN_FAULT, UNKNOWN_FAILURE_PATTERN
    predicted_diagnosis = Column(String, nullable=True) # e.g. Bearing Degradation, Motor Overheat, None
    known_probability = Column(Float, default=0.0)
    unknown_probability = Column(Float, default=0.0)
    anomaly_score = Column(Float, default=0.0)
    novelty_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    trust_level = Column(String, default="HIGH_TRUST")   # HIGH_TRUST, MEDIUM_TRUST, LOW_TRUST, UNKNOWN
    refused_confident_diagnosis = Column(Boolean, default=False)
    human_verification_required = Column(Boolean, default=False)

    explanation = Column(JSON, nullable=True)           # 8-question answers
    machine = relationship("Machine", back_populates="incidents")
    evidences = relationship("IncidentEvidence", back_populates="incident", cascade="all, delete-orphan")
    decision = relationship("HumanDecision", back_populates="incident", uselist=False)


class IncidentEvidence(Base):
    __tablename__ = "incident_evidences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), index=True)
    evidence_type = Column(String, nullable=False)       # SUPPORTING, CONTRADICTORY, UNKNOWN_FACTOR
    description = Column(String, nullable=False)
    metric_name = Column(String, nullable=True)
    observed_value = Column(String, nullable=True)
    expected_value = Column(String, nullable=True)
    severity = Column(String, default="MEDIUM")          # LOW, MEDIUM, HIGH

    incident = relationship("Incident", back_populates="evidences")


class HumanDecision(Base):
    __tablename__ = "human_decisions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), unique=True, index=True)
    action = Column(String, nullable=False)             # CONFIRM, REJECT, MARK_UNKNOWN, REQUEST_EVIDENCE
    reason = Column(String, nullable=False)             # Predefined reasons: Sensor issue, Recent maintenance, etc.
    notes = Column(Text, nullable=True)
    operator_id = Column(String, default="ENG-402 (Lead Reliability Eng)")
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    final_diagnosis = Column(String, nullable=True)
    staged_for_retraining = Column(Boolean, default=True)

    incident = relationship("Incident", back_populates="decision")


class MaintenanceDocument(Base):
    __tablename__ = "maintenance_documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    document_code = Column(String, nullable=False)
    section = Column(String, nullable=False)
    category = Column(String, nullable=False)           # BEARING, THERMAL, VIBRATION, ELECTRICAL
    content = Column(Text, nullable=False)
    keywords = Column(String, nullable=False)


def init_db():
    Base.metadata.create_all(bind=engine)
