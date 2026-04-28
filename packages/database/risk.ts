import { type RiskLevel } from "./generated/client";

// Global risk thresholds for ACWR
export const RISK_THRESHOLDS = {
  acwr: {
    critical: 2.0,
    high: 1.5,
    moderate: 1.3,
  },
} as const;

export function determineRiskLevel(acwr: number | null): RiskLevel {
  if (acwr === null) return "LOW";
  if (acwr >= RISK_THRESHOLDS.acwr.critical) return "CRITICAL";
  if (acwr >= RISK_THRESHOLDS.acwr.high) return "HIGH";
  if (acwr >= RISK_THRESHOLDS.acwr.moderate) return "MODERATE";
  return "LOW";
}
