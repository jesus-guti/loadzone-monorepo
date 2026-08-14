/**
 * BodyRegion catalog + hotspot metadata (JES-31 / JES-50).
 * Ids must match artifacts/body-region-catalog.json and Prisma BodyRegionId.
 */

import catalogJson from "./body-region-catalog.json";

export const BODY_REGION_IDS = [
  "HEAD",
  "NECK",
  "SHOULDER_R",
  "SHOULDER_L",
  "UPPER_ARM_R",
  "UPPER_ARM_L",
  "ELBOW_R",
  "ELBOW_L",
  "WRIST_HAND_R",
  "WRIST_HAND_L",
  "CHEST",
  "ABDOMEN",
  "UPPER_BACK",
  "LOWER_BACK",
  "HIP_GROIN_R",
  "HIP_GROIN_L",
  "GLUTE_R",
  "GLUTE_L",
  "THIGH_FRONT_R",
  "THIGH_FRONT_L",
  "THIGH_BACK_R",
  "THIGH_BACK_L",
  "KNEE_R",
  "KNEE_L",
  "SHIN_R",
  "SHIN_L",
  "CALF_R",
  "CALF_L",
  "ANKLE_R",
  "ANKLE_L",
  "FOOT_R",
  "FOOT_L",
] as const;

export type BodyRegionCatalogId = (typeof BODY_REGION_IDS)[number];

export type BodyMapView = "front" | "back";

export type BodyRegionHotspot = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
};

export type BodyRegionCatalogEntry = {
  readonly id: BodyRegionCatalogId;
  readonly labelEs: string;
  readonly view: BodyMapView;
  readonly hotspot: BodyRegionHotspot;
};

export type BodyRegionCatalogAssets = {
  readonly front: string;
  readonly back: string;
  readonly width: number;
  readonly height: number;
  readonly notes: string;
};

export type BodyRegionCatalog = {
  readonly version: number;
  readonly assets: BodyRegionCatalogAssets;
  readonly regionDetail: {
    readonly requiredCatalog: boolean;
    readonly optionalFreeTextField: string;
    readonly labelEs: string;
    readonly otherRegion: boolean;
  };
  readonly regions: readonly BodyRegionCatalogEntry[];
};

function isBodyRegionCatalogId(value: string): value is BodyRegionCatalogId {
  return (BODY_REGION_IDS as readonly string[]).includes(value);
}

function parseCatalog(raw: typeof catalogJson): BodyRegionCatalog {
  const regions: BodyRegionCatalogEntry[] = [];
  for (const region of raw.regions) {
    if (!isBodyRegionCatalogId(region.id)) {
      throw new Error(`Unknown BodyRegion catalog id: ${region.id}`);
    }
    if (region.view !== "front" && region.view !== "back") {
      throw new Error(`Invalid BodyRegion view for ${region.id}`);
    }
    regions.push({
      id: region.id,
      labelEs: region.labelEs,
      view: region.view,
      hotspot: {
        cx: region.hotspot.cx,
        cy: region.hotspot.cy,
        r: region.hotspot.r,
      },
    });
  }

  return {
    version: raw.version,
    assets: {
      front: raw.assets.front,
      back: raw.assets.back,
      width: raw.assets.width,
      height: raw.assets.height,
      notes: raw.assets.notes,
    },
    regionDetail: {
      requiredCatalog: raw.regionDetail.requiredCatalog,
      optionalFreeTextField: raw.regionDetail.optionalFreeTextField,
      labelEs: raw.regionDetail.labelEs,
      otherRegion: raw.regionDetail.otherRegion,
    },
    regions,
  };
}

export const bodyRegionCatalog: BodyRegionCatalog = parseCatalog(catalogJson);

export const bodyRegionById: ReadonlyMap<
  BodyRegionCatalogId,
  BodyRegionCatalogEntry
> = new Map(bodyRegionCatalog.regions.map((region) => [region.id, region]));

/** Admin Next static paths for front/back body-map assets. */
export const BODY_MAP_PUBLIC_ASSET_PATHS = {
  front: "/body-map/front.png",
  back: "/body-map/back.png",
} as const;
