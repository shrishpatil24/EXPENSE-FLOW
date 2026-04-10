import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50",
          // Sizing
          size === "sm" && "px-4 py-2 text-xs",
          size === "md" && "px-6 py-3 text-sm",
          size === "lg" && "px-8 py-4 text-base",
          // Variants
          variant === "primary" && "primary-gradient text-white shadow-lg shadow-primary/20",
          variant === "secondary" && "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200",
          variant === "ghost" && "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
