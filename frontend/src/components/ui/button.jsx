import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-v2 inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-v2-primary",
        primary: "btn-v2-primary",
        secondary: "btn-v2-secondary",
        outline: "btn-v2-outline",
        ghost: "btn-v2-ghost",
        destructive: "btn-v2-danger",
        danger: "btn-v2-danger",
        glass: "btn-v2-glass",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "btn-v2-md",
        sm: "btn-v2-sm",
        md: "btn-v2-md",
        lg: "btn-v2-lg",
        icon: "h-9 w-9 btn-v2-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
