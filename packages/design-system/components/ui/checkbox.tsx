"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon } from "@phosphor-icons/react/ssr"

import { cn } from "@repo/design-system/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-border-primary bg-bg-primary data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=checked]:border-brand focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger size-4 shrink-0 rounded-[4px] border transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
