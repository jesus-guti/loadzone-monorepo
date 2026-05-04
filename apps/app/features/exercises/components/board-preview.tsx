"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useId, type ReactElement, type ReactNode } from "react";
import type {
  ArrowElement,
  BallElement,
  BoardElement,
  BoardModel,
  DrawingElement,
  EquipmentElement,
  PlayerElement,
} from "./tactics-board/use-board-store";

const BOARD_W = 1200;
const BOARD_H = 780;

export type BoardPreviewDensity = "comfortable" | "compact";

function pointsToSvgPolyline(points: readonly number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) {
    pairs.push(`${points[i]},${points[i + 1]}`);
  }
  return pairs.join(" ");
}

function positionStyle(
  x: number,
  y: number
): { readonly left: string; readonly top: string } {
  return {
    left: `${(x / BOARD_W) * 100}%`,
    top: `${(y / BOARD_H) * 100}%`,
  };
}

function PitchMarkings(): ReactElement {
  return (
    <>
      <span className="absolute inset-[5.5%] rounded-lg border-2 border-white/75" />
      <span className="absolute top-[5.5%] bottom-[5.5%] left-1/2 w-0.5 -translate-x-1/2 bg-white/65" />
      <span className="absolute top-1/2 left-1/2 size-[18%] max-h-[28%] max-w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/65" />
    </>
  );
}

function PreviewBall({ element }: { readonly element: BallElement }) {
  const pos = positionStyle(element.x, element.y);
  return (
    <span
      className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center rounded-full border-2 border-text-primary bg-white shadow-sm"
      style={{
        ...pos,
        width: "1.55em",
        height: "1.55em",
      }}
    >
      <span className="absolute h-[0.12em] w-[55%] rounded-full bg-text-primary" />
      <span className="absolute h-[55%] w-[0.12em] rounded-full bg-text-primary" />
    </span>
  );
}

function PreviewPlayer({
  element,
  teamColors,
}: {
  readonly element: PlayerElement;
  readonly teamColors: BoardModel["teamColors"];
}) {
  const pos = positionStyle(element.x, element.y);
  const fill = element.team === "home" ? teamColors.home : teamColors.away;
  return (
    <span
      className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center rounded-full border-2 border-white font-bold text-[0.62em] text-white shadow-sm tabular-nums"
      style={{
        ...pos,
        width: "2.35em",
        height: "2.35em",
        backgroundColor: fill,
      }}
    >
      {element.number}
    </span>
  );
}

function PreviewCone({ element }: { readonly element: EquipmentElement }) {
  const pos = positionStyle(element.x, element.y);
  return (
    <span
      className="-translate-x-1/2 -translate-y-1/2 absolute border-x-[0.55em] border-b-[0.95em] border-x-transparent border-b-orange-500 drop-shadow-sm"
      style={pos}
    />
  );
}

function PreviewPole({ element }: { readonly element: EquipmentElement }) {
  const pos = positionStyle(element.x, element.y);
  return (
    <span
      className="-translate-x-1/2 -translate-y-1/2 absolute w-[0.38em] rounded-sm bg-amber-500 shadow-sm"
      style={{
        ...pos,
        height: "2.05em",
      }}
    />
  );
}

function PreviewMiniGoal({
  element,
}: {
  readonly element: EquipmentElement;
}) {
  const pos = positionStyle(element.x, element.y);
  return (
    <span
      className="-translate-x-1/2 -translate-y-1/2 absolute"
      style={pos}
    >
      <span className="relative block h-[1.15em] w-[2em] rounded-sm border-[0.15em] border-white bg-transparent shadow-sm">
        <span className="absolute top-1/2 left-1/2 h-[0.12em] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#17633a]" />
      </span>
    </span>
  );
}

function PreviewEquipment({
  element,
}: {
  readonly element: EquipmentElement;
}) {
  if (element.kind === "cone") {
    return <PreviewCone element={element} />;
  }
  if (element.kind === "pole") {
    return <PreviewPole element={element} />;
  }
  return <PreviewMiniGoal element={element} />;
}

function PreviewVectorLayer({
  elements,
  markerId,
}: {
  readonly elements: readonly BoardElement[];
  readonly markerId: string;
}) {
  const drawings = elements.filter(
    (el): el is DrawingElement => el.type === "drawing"
  );
  const arrows = elements.filter(
    (el): el is ArrowElement => el.type === "arrow"
  );

  if (drawings.length === 0 && arrows.length === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
      role="presentation"
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
    >
      <defs>
        <marker
          id={markerId}
          markerHeight="7"
          markerUnits="strokeWidth"
          markerWidth="7"
          orient="auto"
          refX="6"
          refY="3"
        >
          <polygon fill="#f8fafc" points="0 0, 7 3, 0 6" />
        </marker>
      </defs>
      {drawings.map((el) => {
        if (el.points.length < 4) {
          return null;
        }
        return (
          <polyline
            fill="none"
            key={el.id}
            points={pointsToSvgPolyline(el.points)}
            stroke={el.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={Math.max(1.2, el.strokeWidth / 3.2)}
          />
        );
      })}
      {arrows.map((el) => {
        if (el.points.length < 4) {
          return null;
        }
        return (
          <polyline
            fill="none"
            key={el.id}
            markerEnd={`url(#${markerId})`}
            points={pointsToSvgPolyline(el.points)}
            stroke="#f8fafc"
            {...(el.variant === "pass"
              ? { strokeDasharray: "14 10" }
              : {})}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={el.variant === "pass" ? 3.2 : 4}
          />
        );
      })}
    </svg>
  );
}

function renderMarkers(
  elements: readonly BoardElement[],
  teamColors: BoardModel["teamColors"]
): ReactNode {
  return elements.map((el) => {
    if (el.type === "player") {
      return <PreviewPlayer element={el} key={el.id} teamColors={teamColors} />;
    }
    if (el.type === "ball") {
      return <PreviewBall element={el} key={el.id} />;
    }
    if (el.type === "equipment") {
      return <PreviewEquipment element={el} key={el.id} />;
    }
    return null;
  });
}

export function BoardPreview({
  data,
  className,
  density = "comfortable",
}: {
  readonly data?: string;
  readonly className?: string;
  readonly density?: BoardPreviewDensity;
}) {
  const markerUid = useId().replace(/:/g, "");
  const arrowMarkerId = `board-preview-arrow-${markerUid}`;

  const densityClass =
    density === "compact"
      ? "text-[clamp(5px,0.26cqmin,10px)]"
      : "text-[clamp(6px,0.32cqmin,13px)]";

  if (!data) {
    return (
      <EmptyBoardPreview className={className} densityClass={densityClass} />
    );
  }

  try {
    const model = JSON.parse(data) as BoardModel;
    const elements = model.frames[0]?.elements ?? [];

    return (
      <span
        className={cn(
          "relative block h-full w-full overflow-hidden bg-[#17633a] @container-[size]",
          densityClass,
          className
        )}
      >
        <PitchMarkings />
        <PreviewVectorLayer
          elements={elements}
          markerId={arrowMarkerId}
        />
        <span className="relative z-5 block h-full w-full">
          {renderMarkers(elements, model.teamColors)}
        </span>
      </span>
    );
  } catch {
    return (
      <EmptyBoardPreview className={className} densityClass={densityClass} />
    );
  }
}

function EmptyBoardPreview({
  className,
  densityClass,
}: {
  readonly className?: string;
  readonly densityClass: string;
}) {
  return (
    <span
      className={cn(
        "relative block h-full w-full overflow-hidden bg-[#17633a] @container-[size]",
        densityClass,
        className
      )}
    >
      <PitchMarkings />
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[28%] left-[22%] flex size-[2.35em] items-center justify-center rounded-full border-2 border-white bg-[#2563eb] text-[0.62em] font-bold text-white tabular-nums shadow-sm"
      >
        7
      </span>
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[46%] left-[34%] flex size-[2.35em] items-center justify-center rounded-full border-2 border-white bg-[#2563eb] text-[0.62em] font-bold text-white tabular-nums shadow-sm"
      >
        8
      </span>
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[62%] left-[24%] flex size-[2.35em] items-center justify-center rounded-full border-2 border-white bg-[#2563eb] text-[0.62em] font-bold text-white tabular-nums shadow-sm"
      >
        6
      </span>
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[32%] left-[76%] flex size-[2.35em] items-center justify-center rounded-full border-2 border-white bg-[#dc2626] text-[0.62em] font-bold text-white tabular-nums shadow-sm"
      >
        4
      </span>
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[56%] left-[66%] flex size-[2.35em] items-center justify-center rounded-full border-2 border-white bg-[#dc2626] text-[0.62em] font-bold text-white tabular-nums shadow-sm"
      >
        5
      </span>
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[48%] left-[80%] flex size-[1.55em] items-center justify-center rounded-full border-2 border-text-primary bg-white shadow-sm"
      >
        <span className="absolute h-[0.12em] w-[55%] rounded-full bg-text-primary" />
        <span className="absolute h-[55%] w-[0.12em] rounded-full bg-text-primary" />
      </span>
      <span className="pointer-events-none absolute top-[37%] left-[42%] h-[0.12em] w-[12%] rotate-12 border-t-2 border-dashed border-white/80" />
    </span>
  );
}
