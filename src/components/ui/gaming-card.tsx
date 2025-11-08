import * as React from "react"
import { cn } from "@/lib/utils"

const GamingCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glow" | "cyber" | "earth"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "pixel-panel",
    glow: "pixel-panel pixel-effect",
    cyber: "bg-gradient-card border-2 border-secondary pixel-effect hover:border-secondary",
    earth: "bg-earth/20 border-2 border-earth/60 pixel-panel"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "hover-pixel transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
GamingCard.displayName = "GamingCard"

const GamingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
GamingCardHeader.displayName = "GamingCardHeader"

const GamingCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-pixel text-xl font-bold leading-none tracking-tight gradient-text", className)}
    {...props}
  />
))
GamingCardTitle.displayName = "GamingCardTitle"

const GamingCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GamingCardDescription.displayName = "GamingCardDescription"

const GamingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
GamingCardContent.displayName = "GamingCardContent"

const GamingCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
GamingCardFooter.displayName = "GamingCardFooter"

export { 
  GamingCard, 
  GamingCardHeader, 
  GamingCardFooter, 
  GamingCardTitle, 
  GamingCardDescription, 
  GamingCardContent 
}