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
          "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:grayscale-[0.2]",
          size === "sm" && "px-4 py-2 text-xs rounded-lg",
          size === "md" && "px-6 py-3 text-sm rounded-xl",
          size === "lg" && "px-8 py-4 text-base rounded-2xl",
          variant === "primary" &&
            cn(
              "primary-gradient text-white shadow-lg shadow-primary/25",
              "relative overflow-hidden",
              "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:skew-x-12",
              "before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent",
              "hover:before:translate-x-full before:transition-transform before:duration-700"
            ),
          variant === "secondary" &&
            "bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md",
          variant === "ghost" &&
            "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
