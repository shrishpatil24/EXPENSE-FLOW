import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-sm text-slate-900",
          "ring-offset-background placeholder:text-slate-400",
          "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:shadow-md",
          "hover:border-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
