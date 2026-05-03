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

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
