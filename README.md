# UNKNOWN-X 🤖⚡

## When Industrial AI Is Wrong: Detecting and Escalating AI Uncertainty in Industrial Fault Diagnosis

> **"Don't just detect failure. Detect when AI doesn't understand the failure."**

**Hackathon Theme: Human–AI Collaboration**

---

## 🎯 What is UNKNOWN-X?

UNKNOWN-X is an industrial **Human–AI Collaboration** decision-support platform that addresses a critical vulnerability in industrial AI: most fault-diagnosis systems are trained on known failure categories and will **force-classify** unfamiliar patterns into the nearest known class — with misplaced confidence.

UNKNOWN-X detects when the AI is **epistemically uncertain**, refuses to make a forced diagnosis, and escalates to a human expert with a full structured reasoning report.

---

## 🧠 Core Innovation

| Traditional AI | UNKNOWN-X |
|---|---|
| Classifies every input | Knows when it doesn't know |
| Single confidence score | Multi-axis uncertainty quantification |
| Silent failure | Explainable refusal + escalation |
| No human loop | Structured human-in-the-loop review |
| No feedback | Staged retraining from human decisions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   React + TypeScript Frontend   │  ← Vite, Recharts, Tailwind CSS v4
│   Real-time Dashboard UI        │
└──────────────┬──────────────────┘
               │ HTTP / Proxy
┌──────────────▼──────────────────┐
│   FastAPI Backend               │  ← Python, SQLAlchemy, SQLite
│   /api/simulate                 │
│   /api/incidents/{id}           │
│   /api/incidents/{id}/human-decision │
│   /api/feedback/stats           │
│   /api/telemetry/live           │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   ML Core                       │
│   • Fault Classifier (RFC)      │
│   • Novelty Detector (IsoForest)│
│   • Feature Extractor           │
│   • Uncertainty Engine          │
│   • Contradiction Engine        │
│   • Explanation Engine (RAG)    │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎬 Demo Scenarios

| Scenario | Description |
|---|---|
| ✅ **Normal Operation** | All sensors within baseline — AI confident, no escalation |
| ⚠️ **Bearing Fault** | Known failure pattern — AI diagnoses with high confidence |
| 🔥 **Motor Overheat** | Known failure pattern — AI diagnoses with high confidence |
| 🔴 **Unknown Failure** | Novel pattern — AI **refuses** forced diagnosis, escalates to human |

---

## 🔬 Key Features

- **Multi-Axis Uncertainty Quantification**: Softmax entropy, novelty score, sensor contradiction, knowledge gap
- **Epistemic Refusal Engine**: AI refuses to classify when uncertainty exceeds threshold
- **Evidence vs. Contradiction Display**: Supporting and contradicting sensor evidence visualized
- **RAG-Powered Knowledge Retrieval**: ISO standards and maintenance procedures retrieved for context
- **Human Review Modal**: Structured operator decision submission (Confirm / Reject / Mark Unknown / Request Evidence)
- **Audit Timeline**: Full chronological log of AI decisions and human interventions
- **Feedback Analytics**: AI–human agreement rates, override reasons, staged retraining queue

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── api/routes.py        # All API endpoints
│   │   ├── models/database.py   # SQLAlchemy ORM models
│   │   ├── schemas/schemas.py   # Pydantic schemas
│   │   ├── ml/
│   │   │   ├── fault_classifier.py
│   │   │   ├── novelty_detector.py
│   │   │   └── feature_extractor.py
│   │   ├── services/
│   │   │   ├── uncertainty_engine.py
│   │   │   ├── contradiction_engine.py
│   │   │   └── explanation_engine.py
│   │   ├── simulation/sensor_simulator.py
│   │   └── rag/knowledge_base.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── DemoControls.tsx
│   │   │   ├── SensorTelemetryPanel.tsx
│   │   │   ├── IncidentReasoningPanel.tsx
│   │   │   ├── EvidenceContradictionView.tsx
│   │   │   ├── MaintenanceKnowledgeView.tsx
│   │   │   ├── IncidentTimelineView.tsx
│   │   │   ├── HumanReviewModal.tsx
│   │   │   └── FeedbackAnalyticsModal.tsx
│   │   ├── services/api.ts
│   │   └── types/index.ts
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🏆 Hackathon Theme Alignment

**Human–AI Collaboration** — UNKNOWN-X demonstrates that the best AI systems don't just automate decisions; they know their own limits, explain their uncertainty, and create space for meaningful human judgment in high-stakes industrial environments.

> *"It knows when it does not know."*
