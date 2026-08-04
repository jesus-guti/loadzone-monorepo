/**
 * Best-effort legacy InjuryReport bodyPart/side → BodyRegion catalog ids (JES-50 HITL A).
 * Mirrors migration SQL heuristic for unit tests and tooling.
 */

import {
  BODY_REGION_IDS,
  type BodyRegionCatalogId,
} from "./body-region-catalog";

export type LegacyInjurySide = "LEFT" | "RIGHT" | "BILATERAL" | "CENTRAL" | null;

type LateralBase =
  | "SHOULDER"
  | "UPPER_ARM"
  | "ELBOW"
  | "WRIST_HAND"
  | "HIP_GROIN"
  | "GLUTE"
  | "THIGH_FRONT"
  | "THIGH_BACK"
  | "KNEE"
  | "SHIN"
  | "CALF"
  | "ANKLE"
  | "FOOT";

type CentralBase =
  | "HEAD"
  | "NECK"
  | "CHEST"
  | "ABDOMEN"
  | "UPPER_BACK"
  | "LOWER_BACK";

function normalizeBodyPart(bodyPart: string): string {
  return bodyPart
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function resolveBase(normalized: string): CentralBase | LateralBase | null {
  if (/(cabeza|head|craneo|cranium|skull)/.test(normalized)) return "HEAD";
  if (/(cuello|neck|cervical)/.test(normalized)) return "NECK";
  if (/(hombro|shoulder)/.test(normalized)) return "SHOULDER";
  if (/(codo|elbow)/.test(normalized)) return "ELBOW";
  if (/(muneca|wrist|mano|hand)/.test(normalized)) return "WRIST_HAND";
  if (/(brazo|upper.?arm|bicep|tricep)/.test(normalized)) return "UPPER_ARM";
  if (/(pecho|chest|torax|thorax|sternum)/.test(normalized)) return "CHEST";
  if (/(abdomen|abdominal|core)/.test(normalized)) return "ABDOMEN";
  if (/(espalda baja|lower.?back|lumbar)/.test(normalized)) return "LOWER_BACK";
  if (/(espalda alta|upper.?back|dorsal)/.test(normalized)) return "UPPER_BACK";
  if (/(espalda|back)/.test(normalized)) return "UPPER_BACK";
  if (/(cadera|hip|ingle|groin|adductor)/.test(normalized)) return "HIP_GROIN";
  if (/(gluteo|glute|nalga|buttock)/.test(normalized)) return "GLUTE";
  if (/(isquio|hamstring|muslo posterior|thigh.?back|posterior.?thigh)/.test(normalized)) {
    return "THIGH_BACK";
  }
  if (/(cuadricep|quad|muslo anterior|thigh.?front|anterior.?thigh)/.test(normalized)) {
    return "THIGH_FRONT";
  }
  if (/(muslo|thigh)/.test(normalized)) return "THIGH_FRONT";
  if (/(rodilla|knee)/.test(normalized)) return "KNEE";
  if (/(gemelo|pantorrilla|calf)/.test(normalized)) return "CALF";
  if (/(tibia|shin|pierna anterior|lower.?leg)/.test(normalized)) return "SHIN";
  if (/(tobillo|ankle)/.test(normalized)) return "ANKLE";
  if (/(pie|foot|talon|heel)/.test(normalized)) return "FOOT";
  return null;
}

const CENTRAL_BASES = new Set<string>([
  "HEAD",
  "NECK",
  "CHEST",
  "ABDOMEN",
  "UPPER_BACK",
  "LOWER_BACK",
]);

function assertCatalogId(value: string): BodyRegionCatalogId {
  if (!(BODY_REGION_IDS as readonly string[]).includes(value)) {
    throw new Error(`Mapped id not in catalog: ${value}`);
  }
  return value as BodyRegionCatalogId;
}

function expandLateral(
  base: LateralBase,
  side: LegacyInjurySide
): BodyRegionCatalogId[] {
  if (side === "LEFT") {
    return [assertCatalogId(`${base}_L`)];
  }
  if (side === "RIGHT") {
    return [assertCatalogId(`${base}_R`)];
  }
  return [assertCatalogId(`${base}_L`), assertCatalogId(`${base}_R`)];
}

/**
 * Returns catalog region ids for a legacy free-text body part.
 * Empty array ⇒ orphan (store regionDetail, zero InjuryBodyRegion rows).
 */
export function mapLegacyBodyPartToRegions(
  bodyPart: string | null | undefined,
  side: LegacyInjurySide = null
): BodyRegionCatalogId[] {
  if (!bodyPart || bodyPart.trim().length === 0) {
    return [];
  }
  const base = resolveBase(normalizeBodyPart(bodyPart));
  if (!base) {
    return [];
  }
  if (CENTRAL_BASES.has(base)) {
    return [assertCatalogId(base)];
  }
  return expandLateral(base as LateralBase, side);
}

export function buildOrphanRegionDetail(args: {
  readonly bodyPart?: string | null;
  readonly side?: LegacyInjurySide;
  readonly injuryType?: string | null;
}): string | null {
  const parts = [
    args.bodyPart?.trim() || null,
    args.side ?? null,
    args.injuryType?.trim() || null,
  ].filter((part): part is string => Boolean(part));
  if (parts.length === 0) {
    return null;
  }
  return parts.join(" · ");
}
