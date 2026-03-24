import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-bg-mid dark:border-[#3d2a5a] bg-white dark:bg-[#2d1f45] px-3 py-2 text-sm text-dark dark:text-bg-mid transition-all focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-40 placeholder:text-bg-muted",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
