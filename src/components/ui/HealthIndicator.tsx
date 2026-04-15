"use client";

import { motion } from "framer-motion";

interface HealthIndicatorProps {
  health: number;
  status: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export function HealthIndicator({ health, status, color, size = "md" }: HealthIndicatorProps) {
  const sizeClasses = {
    sm: "h-1 w-16",
    md: "h-2 w-24",
    lg: "h-3 w-40"
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-0.5">
        <span 
          className="text-[10px] font-black uppercase tracking-tighter"
          style={{ color }}
        >
          {status}
        </span>
        <span className="text-[10px] font-bold text-slate-400">{Math.round(health)}%</span>
      </div>
      <div className={`${sizeClasses[size]} bg-slate-100 rounded-full overflow-hidden titanium-border p-[1px]`}>
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${health}%` }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
           style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
