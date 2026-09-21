import type { Machine, SensorReading, IncidentDetail, TimelineEvent, FeedbackStats, KnowledgeItem } from '../types';

const API_BASE = '/api';

export async function fetchMachines(): Promise<Machine[]> {
  const res = await fetch(`${API_BASE}/machines`);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

export async function fetchLiveTelemetry(): Promise<SensorReading[]> {
  const res = await fetch(`${API_BASE}/telemetry/live`);
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export async function simulateScenario(scenario: string, machineId: string = 'MOTOR-04'): Promise<any> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, machine_id: machineId, duration_points: 40 })
  });
  if (!res.ok) throw new Error(`Simulation failed for ${scenario}`);
  return res.json();
}

export async function triggerAnalysis(): Promise<IncidentDetail> {
  const res = await fetch(`${API_BASE}/analyze`, { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string): Promise<IncidentDetail> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch incident details');
  return res.json();
}

export async function submitHumanDecision(
  incidentId: string,
  payload: { action: string; reason: string; notes?: string; operator_id?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/human-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit human decision');
  return res.json();
}

export async function fetchTimeline(incidentId: string): Promise<TimelineEvent[]> {
  const res = await fetch(`${API_BASE}/timeline/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchFeedbackStats(): Promise<FeedbackStats> {
  const res = await fetch(`${API_BASE}/feedback/stats`);
  if (!res.ok) throw new Error('Failed to fetch feedback stats');
  return res.json();
}

export async function searchKnowledge(query: string): Promise<KnowledgeItem[]> {
  const res = await fetch(`${API_BASE}/knowledge/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search knowledge');
  return res.json();
}
