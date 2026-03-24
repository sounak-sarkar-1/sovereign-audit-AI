import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-bg-warm dark:bg-[#261840]", className)}
      {...props}
    />
  )
}

export { Skeleton }
