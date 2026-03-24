import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 transition-colors focus:outline-none focus:shadow-focus",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-white",
        draft:
          "rounded-full bg-bg-warm text-bg-muted",
        inProgress:
          "rounded-full bg-[#e8f0fb] text-[#1565c0]",
        underReview:
          "rounded-full bg-[#f0eaff] text-primary",
        pendingClient:
          "rounded-full bg-[#fff8e1] text-[#f57f17]",
        submitted:
          "rounded-full bg-[#edf7ed] text-[#2e7d32]",
        returned:
          "rounded-full bg-[#fef0f0] text-[#c62828]",
        optional:
          "rounded-full bg-bg-muted text-white",
        auditId:
          "rounded-sm bg-bg-warm text-bg-muted font-mono px-2",
        secondary:
          "rounded-full bg-bg-warm text-dark",
        approved:
          "rounded-full bg-[#edf7ed] text-[#2e7d32]",
        rejected:
          "rounded-full bg-[#fef0f0] text-[#c62828]",
        destructive:
          "rounded-full bg-destructive text-white",
        closed:
          "rounded-full bg-bg-mid text-dark dark:text-white",
        outline: "rounded-full border border-bg-mid text-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
