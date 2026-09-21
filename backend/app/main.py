import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.models.database import init_db, SessionLocal, Machine, MaintenanceDocument
from backend.app.api.routes import router as api_router
from backend.app.rag.knowledge_base import knowledge_base


def seed_database():
    db = SessionLocal()
    try:
        # Seed machines if not present
        if db.query(Machine).count() == 0:
            machines = [
                Machine(
                    id="MOTOR-04",
                    name="Primary Slurry Booster Motor-04",
                    machine_type="75kW Induction Motor (3-Phase)",
                    location="Processing Bay 4 - Slurry Prep Line",
                    rated_rpm=1800.0,
                    rated_power_kw=75.0,
                    bearing_type="SKF 6210-2Z Deep Groove Ball Bearing",
                    last_service_date="14 days ago",
                    last_service_notes="Drive-end bearing replaced & dynamic balanced to ISO G2.5 (WO-8821)",
                    status="NORMAL"
                ),
                Machine(
                    id="COMPRESSOR-02",
                    name="High-Pressure Screw Compressor-02",
                    machine_type="Twin-Screw Rotary Compressor",
                    location="Utility Building - Pneumatics Room",
                    rated_rpm=3000.0,
                    rated_power_kw=110.0,
                    bearing_type="SKF Cylindrical Roller Bearing NUP 218",
                    last_service_date="45 days ago",
                    last_service_notes="Oil filter replaced, cooling circuit flushed",
                    status="NORMAL"
                ),
                Machine(
                    id="TURBINE-01",
                    name="Co-Gen Steam Turbine-01",
                    machine_type="Multi-Stage Steam Turbine",
                    location="Power Generation Annex",
                    rated_rpm=3600.0,
                    rated_power_kw=450.0,
                    bearing_type="Hydrodynamic Tilting-Pad Journal Bearings",
                    last_service_date="90 days ago",
                    last_service_notes="Annual overhaul completed. Lube oil viscosity verified.",
                    status="NORMAL"
                )
            ]
            for m in machines:
                db.add(m)
            db.commit()

        # Seed knowledge base documents if not present
        if db.query(MaintenanceDocument).count() == 0:
            for doc in knowledge_base.DOCUMENTS:
                m_doc = MaintenanceDocument(
                    id=doc["id"],
                    title=doc["title"],
                    document_code=doc["document_code"],
                    section=doc["section"],
                    category=doc["category"],
                    content=doc["content"],
                    keywords=doc["keywords"]
                )
                db.add(m_doc)
            db.commit()

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed
    init_db()
    seed_database()
    yield


# Guarantee tables exist immediately on import
init_db()
seed_database()

app = FastAPI(
    title="UNKNOWN-X Industrial AI Decision Support",
    description="Detecting and Escalating AI Uncertainty in Industrial Fault Diagnosis",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "system": "UNKNOWN-X",
        "tagline": "Don't just detect failure. Detect when AI doesn't understand the failure.",
        "status": "online",
        "docs_url": "/docs"
    }
