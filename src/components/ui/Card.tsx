import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "inset" | "interactive";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "default" && "surface-card",
          variant === "inset" && "surface-inset p-5",
          variant === "interactive" && "surface-card-hover",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
