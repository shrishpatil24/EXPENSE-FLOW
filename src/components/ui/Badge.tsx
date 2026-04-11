import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
        tone === "neutral" &&
          "bg-slate-100 text-slate-600 border border-slate-200/80",
        tone === "primary" &&
          "bg-primary/10 text-primary border border-primary/15",
        tone === "success" &&
          "bg-emerald-50 text-emerald-700 border border-emerald-100",
        tone === "warning" &&
          "bg-amber-50 text-amber-800 border border-amber-100",
        tone === "danger" &&
          "bg-red-50 text-red-700 border border-red-100",
        className
      )}
      {...props}
    />
  );
}
