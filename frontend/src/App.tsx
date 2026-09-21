import React, { useEffect, useState } from 'react';
import type { Machine, SensorReading, IncidentDetail, TimelineEvent, FeedbackStats } from './types';
import {
  fetchMachines,
  fetchLiveTelemetry,
  simulateScenario,
  fetchIncidentDetail,
  submitHumanDecision,
  fetchTimeline,
  fetchFeedbackStats,
} from './services/api';

import { Header } from './components/Header';
import { DemoControls } from './components/DemoControls';
import { SensorTelemetryPanel } from './components/SensorTelemetryPanel';
import { IncidentReasoningPanel } from './components/IncidentReasoningPanel';
import { EvidenceContradictionView } from './components/EvidenceContradictionView';
import { MaintenanceKnowledgeView } from './components/MaintenanceKnowledgeView';
import { IncidentTimelineView } from './components/IncidentTimelineView';
import { HumanReviewModal } from './components/HumanReviewModal';
import { FeedbackAnalyticsModal } from './components/FeedbackAnalyticsModal';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('MOTOR-04');
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial state
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const machinesData = await fetchMachines();
        setMachines(machinesData);

        // Run initial simulation
        const simRes = await simulateScenario('normal', 'MOTOR-04');
        const telemetryData = await fetchLiveTelemetry();
        setSensorData(telemetryData);

        if (simRes.incident_id) {
          const incDetail = await fetchIncidentDetail(simRes.incident_id);
          setIncident(incDetail);
          const tl = await fetchTimeline(simRes.incident_id);
          setTimeline(tl);
        }

        const stats = await fetchFeedbackStats();
        setFeedbackStats(stats);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Handle Scenario Switch
  const handleSelectScenario = async (scenario: string) => {
    try {
      setIsLoading(true);
      setActiveScenario(scenario);
      const res = await simulateScenario(scenario, selectedMachineId);
      
      const telemetryData = await fetchLiveTelemetry();
      setSensorData(telemetryData);

      if (res.incident_id) {
        const incDetail = await fetchIncidentDetail(res.incident_id);
        setIncident(incDetail);
        const tl = await fetchTimeline(res.incident_id);
        setTimeline(tl);
      }

      const stats = await fetchFeedbackStats();
      setFeedbackStats(stats);

      if (scenario === 'unknown_failure') {
        showToast('⚡ UNKNOWN FAILURE PATTERN: AI Refused Confident Diagnosis & Requested Human Verification!');
      } else if (scenario === 'bearing_fault') {
        showToast('⚠ Known Bearing Fault Identified with High Confidence.');
      } else if (scenario === 'motor_overheat') {
        showToast('🔥 Known Motor Overheat Identified with High Confidence.');
      } else {
        showToast('✓ Machine parameters within normal operational baseline.');
      }
    } catch (err) {
      console.error('Scenario selection failed:', err);
      showToast('Error triggering scenario');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Human Review Submission
  const handleSubmitDecision = async (action: string, reason: string, notes: string) => {
    if (!incident) return;
    try {
      setIsSubmittingReview(true);
      await submitHumanDecision(incident.id, {
        action,
        reason,
        notes,
        operator_id: 'ENG-402 (Lead Reliability Eng)',
      });

      // Refresh incident detail, timeline, and feedback stats
      const updatedIncident = await fetchIncidentDetail(incident.id);
      setIncident(updatedIncident);

      const updatedTimeline = await fetchTimeline(incident.id);
      setTimeline(updatedTimeline);

      const updatedStats = await fetchFeedbackStats();
      setFeedbackStats(updatedStats);

      showToast(`Human decision recorded: ${action.replace('_', ' ')}. Staged for retraining.`);
    } catch (err) {
      console.error('Failed to submit decision:', err);
      showToast('Failed to record human decision');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-purple-500/50 text-white text-xs font-bold rounded-xl shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        machines={machines}
        selectedMachineId={selectedMachineId}
        onSelectMachine={setSelectedMachineId}
        status={incident?.status || 'NORMAL'}
        trustLevel={incident?.trust_level || 'HIGH_TRUST'}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6 flex-1 w-full">
        {/* Hackathon Demo Scenario Controller */}
        <DemoControls
          activeScenario={activeScenario}
          onSelectScenario={handleSelectScenario}
          isLoading={isLoading}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onOpenReview={() => setIsReviewOpen(true)}
          humanVerificationRequired={incident?.human_verification_required && !incident?.decision ? true : false}
        />

        {/* Real-Time Multi-Sensor Telemetry */}
        <SensorTelemetryPanel data={sensorData} />

        {/* Diagnostic Assessment & Evidence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: AI Reasoning & Refusal Panel */}
          <div className="lg:col-span-7">
            <IncidentReasoningPanel
              incident={incident}
              onOpenReview={() => setIsReviewOpen(true)}
            />
          </div>

          {/* Right 5 Columns: Supporting vs Contradicting Evidence */}
          <div className="lg:col-span-5">
            <EvidenceContradictionView
              evidences={incident?.evidences || []}
            />
          </div>
        </div>

        {/* Retrieved Maintenance Standards (RAG) */}
        <MaintenanceKnowledgeView
          items={incident?.knowledge_items || []}
        />

        {/* Chronological Incident Audit Timeline */}
        <IncidentTimelineView
          timeline={timeline}
        />
      </main>

      {/* Human Review Modal */}
      {incident && (
        <HumanReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          incident={incident}
          onSubmitDecision={handleSubmitDecision}
          isSubmitting={isSubmittingReview}
        />
      )}

      {/* Feedback Analytics Modal */}
      <FeedbackAnalyticsModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        stats={feedbackStats}
        onRefresh={async () => {
          const stats = await fetchFeedbackStats();
          setFeedbackStats(stats);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>UNKNOWN-X • Human–AI Collaboration in Industrial Fault Diagnosis</span>
          <span className="font-mono text-slate-600">Theme: Human–AI Collaboration • Hackathon Prototype</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
