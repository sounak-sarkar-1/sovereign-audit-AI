"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-bg-warm dark:bg-[#1a0d35]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-accent transition-all duration-500 rounded-full"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value, size = 48, strokeWidth = 8, showValue = false, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div 
        ref={ref} 
        className={cn("relative inline-flex items-center justify-center", className)} 
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-bg-warm dark:text-[#1a0d35] stroke-current"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle with gradient */}
          <circle
            className="transition-all duration-500 stroke-[url(#progress-gradient)]"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2b144d" />
              <stop offset="100%" stopColor="#a06dff" />
            </linearGradient>
          </defs>
        </svg>
        {showValue && (
          <span className="absolute text-[10px] font-bold text-dark dark:text-white">
            {Math.round(value)}%
          </span>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { Progress, CircularProgress }
