import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gamingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-pixel font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        hero: "pixel-panel text-foreground hover-pixel pixel-border",
        neon: "bg-secondary text-secondary-foreground hover:bg-secondary/90 pixel-effect animate-pixel-pulse",
        cyber: "bg-gradient-glow text-primary-foreground hover:opacity-90 hero-pixel",
        earth: "bg-earth text-earth-foreground hover:bg-earth/90 border-2 border-earth hover:border-earth/70 pixel-effect",
        outline: "border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/20 hover-pixel",
        ghost: "text-secondary hover:bg-secondary/20 hover:text-secondary pixel-effect",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "hero",
      size: "default",
    },
  }
)

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gamingButtonVariants> {
  asChild?: boolean
}

const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(gamingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GamingButton.displayName = "GamingButton"

export { GamingButton, gamingButtonVariants }