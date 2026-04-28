import { AssetRecordType, createShapeId, type Editor, type TLImageShape } from "tldraw";

export type TacticalAssetKind = "player" | "material" | "background";

export type TacticalAsset = {
  id: string;
  label: string;
  kind: TacticalAssetKind;
  previewSrc: string;
  width: number;
  height: number;
};

export type BackgroundRecord = TacticalAsset & {
  kind: "background";
};

export const PLAYER_ASSETS: TacticalAsset[] = [
  {
    id: "player-red",
    label: "Jugador rojo",
    kind: "player",
    previewSrc: "/tactics/players/red.svg",
    width: 44,
    height: 44,
  },
  {
    id: "player-blue",
    label: "Jugador azul",
    kind: "player",
    previewSrc: "/tactics/players/blue.svg",
    width: 44,
    height: 44,
  },
  {
    id: "player-gk",
    label: "Portero",
    kind: "player",
    previewSrc: "/tactics/players/gk.svg",
    width: 44,
    height: 44,
  },
];

export const MATERIAL_ASSETS: TacticalAsset[] = [
  {
    id: "material-ball",
    label: "Balón",
    kind: "material",
    previewSrc: "/tactics/material/ball.svg",
    width: 36,
    height: 36,
  },
  {
    id: "material-cone",
    label: "Cono",
    kind: "material",
    previewSrc: "/tactics/material/cone.svg",
    width: 32,
    height: 32,
  },
  {
    id: "material-pole",
    label: "Poste",
    kind: "material",
    previewSrc: "/tactics/material/pole.svg",
    width: 22,
    height: 36,
  },
  {
    id: "material-goal",
    label: "Portería",
    kind: "material",
    previewSrc: "/tactics/material/goal.svg",
    width: 72,
    height: 48,
  },
];

export const BACKGROUNDS: BackgroundRecord[] = [
  {
    id: "bg-full-field",
    label: "Campo completo",
    kind: "background",
    previewSrc: "/tactics/backgrounds/full-field.svg",
    width: 1050,
    height: 680,
  },
  {
    id: "bg-half-field",
    label: "Media cancha",
    kind: "background",
    previewSrc: "/tactics/backgrounds/half-field.svg",
    width: 1050,
    height: 680,
  },
  {
    id: "bg-penalty-area",
    label: "Área",
    kind: "background",
    previewSrc: "/tactics/backgrounds/penalty-area.svg",
    width: 680,
    height: 520,
  },
  {
    id: "bg-futsal-court",
    label: "Pista fútbol sala",
    kind: "background",
    previewSrc: "/tactics/backgrounds/futsal-court.svg",
    width: 840,
    height: 540,
  },
];

export const ALL_PLACEABLE_ASSETS: TacticalAsset[] = [
  ...PLAYER_ASSETS,
  ...MATERIAL_ASSETS,
];

export const ALL_ASSETS_BY_ID: Map<string, TacticalAsset | BackgroundRecord> =
  new Map(
    [...PLAYER_ASSETS, ...MATERIAL_ASSETS, ...BACKGROUNDS].map((asset) => [
      asset.id,
      asset,
    ])
  );

export function getTacticalAssetById(id: string): TacticalAsset | undefined {
  const asset = ALL_ASSETS_BY_ID.get(id);

  if (!asset || asset.kind === "background") {
    return undefined;
  }

  return asset;
}

export function getBackgroundById(id: string): BackgroundRecord | undefined {
  return BACKGROUNDS.find((background) => background.id === id);
}

export function toAbsoluteAssetUrl(src: string): string {
  if (typeof window === "undefined") {
    return src;
  }

  try {
    return new URL(src, window.location.origin).href;
  } catch {
    return src;
  }
}

export async function insertImageAssetAtPoint(
  editor: Editor,
  asset: TacticalAsset,
  pagePoint: { x: number; y: number }
): Promise<void> {
  const assetUrl = toAbsoluteAssetUrl(asset.previewSrc);

  await editor.putExternalContent({
    type: "url",
    url: assetUrl,
    point: pagePoint,
  });
}

export async function insertImageAssetCenterViewport(
  editor: Editor,
  asset: TacticalAsset
): Promise<void> {
  const vp = editor.getViewportPageBounds();

  await insertImageAssetAtPoint(editor, asset, {
    x: vp.x + vp.width / 2,
    y: vp.y + vp.height / 2,
  });
}

export async function insertImageAsset(
  editor: Editor,
  asset: TacticalAsset
): Promise<void> {
  await insertImageAssetCenterViewport(editor, asset);
}

export const TACTICAL_FIELD_META_KEY = "lz-tactical-field";

export function getFieldShape(editor: Editor): TLImageShape | undefined {
  const shapes = editor.getCurrentPageShapes();
  
  return shapes.find(
    (shape): shape is TLImageShape =>
      shape.type === "image" && shape.meta?.[TACTICAL_FIELD_META_KEY] === true
  );
}

export function insertOrReplaceFieldShape(
  editor: Editor,
  backgroundId: string
): void {
  const background = getBackgroundById(backgroundId);

  if (!background) {
    return;
  }

  const assetUrl = toAbsoluteAssetUrl(background.previewSrc);
  const currentField = getFieldShape(editor);
  const assetId = AssetRecordType.createId(background.id);

  const existingAsset = editor.getAsset(assetId);

  if (!existingAsset) {
    editor.createAssets([
      {
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          name: background.label,
          src: assetUrl,
          w: background.width,
          h: background.height,
          mimeType: "image/svg+xml",
          isAnimated: false,
        },
        meta: {},
      },
    ]);
  }

  if (currentField) {
    editor.updateShape<TLImageShape>({
      id: currentField.id,
      type: "image",
      props: {
        assetId,
        w: background.width,
        h: background.height,
      },
    });
  } else {
    const shapeId = createShapeId();
    editor.createShape<TLImageShape>({
      id: shapeId,
      type: "image",
      x: 0,
      y: 0,
      isLocked: false,
      props: {
        assetId,
        w: background.width,
        h: background.height,
      },
      meta: {
        [TACTICAL_FIELD_META_KEY]: true,
      },
    });
    editor.sendToBack([shapeId]);
  }
}

