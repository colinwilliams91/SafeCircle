import type { PredictResponse, RiskLevel } from '../api/safecircle'

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export function riskLevelFrom(labelName: string, unsafeScore: number | null): RiskLevel {
  if (labelName !== 'unsafe') return 'low'
  if (unsafeScore === null) return 'medium'
  if (unsafeScore > 0.8) return 'high'
  return 'medium'
}

export function inferReasons(text: string, labelName: string): string[] {
  const lower = text.toLowerCase()
  const reasons: string[] = []

  if (lower.includes("don't tell") || lower.includes('dont tell')) reasons.push('secrecy request')
  if (lower.includes('meet me')) reasons.push('isolated meetup suggestion')
  if (lower.includes('worthless') || lower.includes('stupid') || lower.includes('nobody likes you'))
    reasons.push('harassment / bullying language')
  if (lower.includes('alone')) reasons.push('isolation-related wording')

  if (reasons.length === 0 && labelName === 'unsafe') reasons.push('unsafe language pattern detected')
  if (reasons.length === 0 && labelName === 'safe') reasons.push('no strong harmful pattern detected')
  return reasons
}

export function normalizePredictResponse(data: PredictResponse): {
  labelName: string
  unsafeScore: number | null
  reasons: string[]
  riskCategory: string
} {
  const labelName = (data.label_name ?? 'unknown').toString()
  const unsafeScore =
    typeof data.unsafe_score === 'number' && Number.isFinite(data.unsafe_score)
      ? clamp01(data.unsafe_score)
      : null
  const riskCategory =
    (typeof data.risk_category === 'string' && data.risk_category.trim()) ||
    (labelName === 'unsafe' ? 'grooming_or_coercion' : 'none')
  const reasons = Array.isArray(data.reasons) && data.reasons.length > 0 ? data.reasons : []

  return { labelName, unsafeScore, reasons, riskCategory }
}

