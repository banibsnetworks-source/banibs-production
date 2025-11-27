import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl-v2 border px-4 py-3 text-sm shadow-base-v2 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-surface-v2 border-surface-alt-v2 text-primary-v2 [&>svg]:text-primary-v2",
        success: "bg-green-600/10 border-green-600/30 text-green-400 [&>svg]:text-green-400",
        warning: "bg-yellow-600/10 border-yellow-600/30 text-yellow-400 [&>svg]:text-yellow-400",
        destructive: "bg-red-600/10 border-red-600/30 text-red-400 [&>svg]:text-red-400",
        info: "bg-blue-600/10 border-blue-600/30 text-blue-400 [&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
