import * as React from "react"

const MOBILE_BREAKPOINT = 768

/** Matches narrow portrait phones (`max-width`) or landscape phones where width exceeds `md` but height is short. */
const COMPACT_BOARD_LAYOUT_MEDIA = `(max-width: ${MOBILE_BREAKPOINT - 1}px), (orientation: landscape) and (max-height: 640px)`

function subscribeCompactBoardLayout(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  const mq = window.matchMedia(COMPACT_BOARD_LAYOUT_MEDIA)
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function getCompactBoardLayoutSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return window.matchMedia(COMPACT_BOARD_LAYOUT_MEDIA).matches
}

/** Edge-to-edge board chrome (dialog / sheets): portrait mobile or landscape with limited height. */
export function useCompactBoardLayout(): boolean {
  return React.useSyncExternalStore(
    subscribeCompactBoardLayout,
    getCompactBoardLayoutSnapshot,
    () => false
  )
}

const MOBILE_MEDIA = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribeMobile(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  const mq = window.matchMedia(MOBILE_MEDIA)
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return window.matchMedia(MOBILE_MEDIA).matches
}

/**
 * False on the server and during the client's first paint that must match SSR,
 * then true after mount. Prefer this over reading `window` during render when
 * Base UI `useId` hosts should stay out of the hydrated tree.
 */
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    () => false
  )
}
