/**
 * Umbrales ACWR compartidos (cliente y servidor).
 * No importar desde `index.ts` del paquete en componentes cliente: ese entry usa `server-only`.
 */

export const RISK_THRESHOLDS = {
  acwr: {
    critical: 2.0,
    high: 1.5,
    moderate: 1.3,
  },
} as const;

/** Alineado con el enum Prisma `RiskLevel` */
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
