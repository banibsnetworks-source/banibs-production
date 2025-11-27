import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "toggle-v2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary-v2 text-slate-950 shadow-base-v2",
        primary:
          "bg-primary-v2 text-slate-950 shadow-base-v2",
        secondary:
          "bg-secondary-v2 text-primary-v2",
        success:
          "bg-green-600/20 text-green-400 border-2 border-green-600/30",
        warning:
          "bg-yellow-600/20 text-yellow-400 border-2 border-yellow-600/30",
        danger:
          "bg-red-600/20 text-red-400 border-2 border-red-600/30",
        info:
          "bg-blue-600/20 text-blue-400 border-2 border-blue-600/30",
        destructive:
          "bg-red-600/20 text-red-400 border-2 border-red-600/30",
        outline: "border-2 border-primary text-primary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
