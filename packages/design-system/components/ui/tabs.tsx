"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { cn } from "@repo/design-system/lib/utils"

type TabsVisualVariant = "underline" | "segmented"

const TabsVisualVariantContext =
  React.createContext<TabsVisualVariant>("underline")

const TAB_UNDERLINE_LAYOUT_ID = "loadzone-tabs-underline"

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === "function") {
        ref(node)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    }
  }
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "underline",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVisualVariant
}) {
  const layoutGroupId = React.useId().replace(/:/g, "")

  if (variant === "segmented") {
    return (
      <TabsVisualVariantContext.Provider value="segmented">
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant="segmented"
          className={cn(
            "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-bg-tertiary p-[3px] text-text-secondary",
            className
          )}
          {...props}
        />
      </TabsVisualVariantContext.Provider>
    )
  }

  return (
    <TabsVisualVariantContext.Provider value="underline">
      <LayoutGroup id={`loadzone-tabs-${layoutGroupId}`}>
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant="underline"
          className={cn(
            "relative flex w-full min-w-0 items-end gap-6 border-b border-border-secondary",
            className
          )}
          {...props}
        />
      </LayoutGroup>
    </TabsVisualVariantContext.Provider>
  )
}

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, children, ...props }, ref) {
  const variant = React.useContext(TabsVisualVariantContext)
  const reduceMotion = useReducedMotion()
  const innerRef = React.useRef<HTMLButtonElement>(null)
  const [underlineActive, setUnderlineActive] = React.useState(false)

  const composedRef = React.useMemo(
    () => composeRefs(ref, innerRef),
    [ref]
  )

  React.useLayoutEffect(() => {
    if (variant !== "underline") return
    const el = innerRef.current
    if (!el) return
    const sync = (): void => {
      setUnderlineActive(el.getAttribute("data-state") === "active")
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-state"],
    })
    return () => observer.disconnect()
  }, [variant])

  const underlineTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 38 }

  if (variant === "segmented") {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        data-slot="tabs-trigger"
        className={cn(
          "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-text-secondary transition-[color,box-shadow] focus-visible:border-border-primary focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-border-secondary data-[state=active]:bg-bg-primary data-[state=active]:text-text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    )
  }

  return (
    <TabsPrimitive.Trigger
      ref={composedRef}
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-none border-0 bg-transparent p-0 text-sm font-normal whitespace-nowrap text-text-secondary outline-none transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:font-semibold data-[state=active]:text-text-primary",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="relative inline-block px-0.5 pb-3">
        {children}
        {underlineActive ? (
          <motion.div
            aria-hidden
            layoutId={TAB_UNDERLINE_LAYOUT_ID}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-text-primary"
            initial={false}
            transition={underlineTransition}
          />
        ) : null}
      </span>
    </TabsPrimitive.Trigger>
  )
})

TabsTrigger.displayName = "TabsTrigger"

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsVisualVariant }
