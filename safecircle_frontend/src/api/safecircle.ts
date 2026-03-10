import { getJson, postJson } from './http'

export type RiskLevel = 'low' | 'medium' | 'high'
export type RiskLabel = 'safe' | 'unsafe' | 'unknown'

export type PredictRequest = {
  text: string
}

export type PredictResponse = {
  label_name?: RiskLabel | string
  unsafe_score?: number
  reasons?: string[]
  risk_category?: string
}

export type PrivacySignal = {
  risk_category: string
  risk_level: RiskLevel
  confidence: number | null
  reasons: string[]
  // Minimal disclosure: no raw transcript in this signal.
  incident_token?: string
  timestamp_bucket?: string
}

export type AnonymousReportResponse = {
  report_id?: string
  message?: string
}

export type GuardianOverview = {
  current_risk_level: RiskLevel
  recent_signals: string[]
  privacy_notes: string[]
}

export async function predictSafety(req: PredictRequest): Promise<PredictResponse> {
  // Backend connection point: FastAPI example endpoint in the PRD uses POST /predict.
  return postJson<PredictResponse>('/predict', req)
}

export async function reportAnonymously(signal: PrivacySignal): Promise<AnonymousReportResponse> {
  // Backend connection point: implement on server as a minimal disclosure report endpoint.
  return postJson<AnonymousReportResponse>('/reports/anonymous', signal)
}

export async function notifyGuardian(signal: PrivacySignal): Promise<{ ok: boolean }> {
  // Backend connection point: consent-based guardian notification (summary only).
  return postJson<{ ok: boolean }>('/guardian/notify', signal)
}

export async function fetchGuardianOverview(): Promise<GuardianOverview> {
  // Backend connection point: guardian dashboard summary (no transcripts).
  return getJson<GuardianOverview>('/guardian/overview')
}

