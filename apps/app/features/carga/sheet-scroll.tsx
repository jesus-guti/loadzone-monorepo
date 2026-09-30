"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function CargaSheetScroll({
  anchorDay,
  children,
}: {
  readonly anchorDay: string | null;
  readonly children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !anchorDay) {
      return;
    }
    const target = root.querySelector(`[data-carga-day="${anchorDay}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const sticky = root.querySelector("[data-carga-name]");
    const stickyWidth =
      sticky instanceof HTMLElement ? sticky.getBoundingClientRect().width : 0;
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const visibleStart = rootRect.left + stickyWidth;
    const visibleWidth = root.clientWidth - stickyWidth;
    root.scrollLeft +=
      targetRect.left +
      targetRect.width / 2 -
      (visibleStart + visibleWidth / 2);
  }, [anchorDay]);

  return (
    <div className="min-h-0 flex-1 overflow-auto" ref={ref}>
      {children}
    </div>
  );
}
