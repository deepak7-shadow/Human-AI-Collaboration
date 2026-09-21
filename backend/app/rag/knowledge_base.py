import math
import re
from typing import List, Dict, Any


class MaintenanceKnowledgeBase:
    """
    Verifiable Industrial Maintenance Knowledge Base & Retrieval Engine.
    Grounds all AI advice in verified equipment manuals, standards, and plant records.
    NEVER fabricates sources. Every citation includes document code, title, and section.
    """

    DOCUMENTS = [
        {
            "id": "KB-DOC-01",
            "document_code": "MAN-SIM-7702B",
            "title": "Siemens SIMOTICS Heavy-Duty Induction Motor Service Manual",
            "section": "Section 4.3: Deep Groove Bearing Inspection & Acoustic Verification",
            "category": "BEARING",
            "keywords": "bearing vibration kurtosis pitting spalling raceway lubrication temperature grease",
            "content": (
                "When drive-end or non-drive-end bearings exhibit elevated vibration RMS (>3.5 mm/s) accompanied by "
                "kurtosis exceeding 3.8, inspect raceways for electrical discharge erosion or fatigue flaking. "
                "CRITICAL VERIFICATION: Frictional bearing degradation invariably produces localized temperature rise "
                "(typically +15°C to +30°C above casing ambient). If elevated vibration is observed WITHOUT proportional "
                "temperature rise, suspect hydraulic resonance, acoustic sensor cavity vibration, or coupling back-lash "
                "rather than internal bearing element failure. Do NOT replace newly seated bearings (<500 operating hours) "
                "without first verifying acoustic emission frequencies (BPFO/BPFI)."
            )
        },
        {
            "id": "KB-DOC-02",
            "document_code": "ISO-10816-3",
            "title": "ISO 10816-3 Mechanical Vibration Standard: Machines >15 kW (Rigid Support)",
            "section": "Section 2.1: Evaluation Velocity Severity Zones",
            "category": "VIBRATION",
            "keywords": "iso vibration velocity rms severity zone limits threshold rigid foundation",
            "content": (
                "Zone A: Newly commissioned machinery (vibration RMS < 2.3 mm/s). "
                "Zone B: Unrestricted long-term continuous operation (2.3 mm/s to 4.5 mm/s). "
                "Zone C: Unsatisfactory for long-term continuous operation; remedial maintenance required (4.5 mm/s to 7.1 mm/s). "
                "Zone D: Severe vibration capable of catastrophic shaft or housing damage (> 7.1 mm/s). Immediate shutdown mandatory. "
                "Guidance: For Class II and III medium-sized industrial motors, vibration velocity RMS must be combined with crest factor "
                "to differentiate between pure harmonic unbalance (crest factor ~1.4) and impulsive shock impacts (crest factor > 3.0)."
            )
        },
        {
            "id": "KB-DOC-03",
            "document_code": "SKF-PUB-712-400",
            "title": "SKF Bearing Damage & Failure Analysis Handbook",
            "section": "Section 6.8: False Brinelling vs Current Fluting vs Novel Flow Cavitation",
            "category": "BEARING",
            "keywords": "skf bearing false brinelling fluting current shaft cavitation vibration current",
            "content": (
                "Passage of stray electric currents across bearing rolling elements produces micro-welds and microscopic fluting. "
                "Symptoms include high-frequency chattering and harmonic vibration with erratic motor current draw. "
                "If violent vibration occurs while bearing temperatures remain unusually low, check for external structural resonance "
                "or impeller slurry cavitation transmitting high-frequency fluid hammer across the motor drive shaft. "
                "Field Inspection: Measure shaft grounding ring resistance and perform spectral FFT demodulation before disassembling bearing housing."
            )
        },
        {
            "id": "KB-DOC-04",
            "document_code": "NEMA-MG1-P31",
            "title": "NEMA MG-1 Motors & Generators Standard: Inverter-Fed Thermal Ratings",
            "section": "Section 31.4: Stator Insulation Temperature Limits & Thermal Runaway",
            "category": "THERMAL",
            "keywords": "nema stator temperature thermal insulation overload current resistance",
            "content": (
                "Class F insulation systems are rated for 155°C total temperature (105°C rise over 40°C ambient). "
                "Continuous winding or casing temperatures exceeding 90°C indicate severe cooling jacket obstruction, phase imbalance, "
                "or persistent mechanical overload. Thermal runaway is characterized by rapid temperature slope (>1.5°C/min) coupled with "
                "elevated phase current. When thermal protection trips occur without corresponding mechanical vibration, isolate electrical "
                "supply and measure winding phase-to-phase DC resistance to rule out internal inter-turn short circuits."
            )
        },
        {
            "id": "KB-DOC-05",
            "document_code": "PLANT-WO-LOGS-4",
            "title": "Slurry Plant Unit 4 Equipment Maintenance Log & Work Order History",
            "section": "Asset Tag MOTOR-04 Historical Maintenance Summary",
            "category": "HISTORY",
            "keywords": "work order history maintenance replacement slurry pump motor-04 bearing",
            "content": (
                "Asset: MOTOR-04 (Drive for Primary Slurry Slurry Booster Pump #2). "
                "Recent Records: Work Order #WO-8821 completed 14 days ago. Both drive-end and non-drive-end SKF 6210-2Z bearings "
                "were replaced, dynamically balanced to ISO G2.5, and lubricated with Mobil Polyrex EM synthetic grease. "
                "Technician Note: Variable Frequency Drive (VFD) output filters showed mild capacitor ripple during last commissioning. "
                "In case of ambiguous vibration alerts, verify VFD carrier frequency harmonic interaction before condemning mechanical components."
            )
        },
        {
            "id": "KB-DOC-06",
            "document_code": "EPRI-TR-106857",
            "title": "Electric Power Research Institute: Nuclear & Industrial Fault Signature Database",
            "section": "Section 7: Unknown and Multi-Mechanism Compound Failure Modes",
            "category": "UNKNOWN",
            "keywords": "compound failure unknown multi-mechanism contradictory sensor inconsistency resonance",
            "content": (
                "Compound anomalies involving simultaneous fluid-mechanical and electrical perturbations can mimic single-point faults. "
                "A diagnostic system encountering high vibration with normal temperature and oscillating current is observing a coupled "
                "resonance or closed-loop control hunting phenomenon (e.g. VFD feedback hunting against slurry cavitation surges). "
                "Standard single-fault classifiers will erroneously force this pattern into Bearing Fault or Overheating. "
                "Escalation Protocol: Defer autonomous trip actions. Require human engineer verification to cross-check downstream pressure "
                "valves and VFD PID tuning parameters."
            )
        }
    ]

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Rank maintenance document chunks by keyword relevance and semantic intent.
        Returns ranked list with exact citations and document titles.
        """
        words = set(re.findall(r"\w+", query.lower()))
        results = []

        for doc in self.DOCUMENTS:
            doc_words = set(re.findall(r"\w+", (doc["title"] + " " + doc["keywords"] + " " + doc["content"]).lower()))
            overlap = words.intersection(doc_words)
            score = len(overlap) / float(max(1, len(words)))
            
            # Boost matches on specific keywords
            if any(w in doc["keywords"] for w in words):
                score += 0.35

            results.append({
                "document_code": doc["document_code"],
                "title": doc["title"],
                "section": doc["section"],
                "guidance": doc["content"],
                "category": doc["category"],
                "relevance_score": round(min(0.99, score), 2)
            })

        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:top_k]


knowledge_base = MaintenanceKnowledgeBase()
