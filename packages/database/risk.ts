import { type RiskLevel } from "./generated/client";
import { RISK_THRESHOLDS } from "./risk-thresholds";

export { RISK_THRESHOLDS } from "./risk-thresholds";

export function determineRiskLevel(acwr: number | null): RiskLevel {
  if (acwr === null) return "LOW";
  if (acwr >= RISK_THRESHOLDS.acwr.critical) return "CRITICAL";
  if (acwr >= RISK_THRESHOLDS.acwr.high) return "HIGH";
  if (acwr >= RISK_THRESHOLDS.acwr.moderate) return "MODERATE";
  return "LOW";
}
