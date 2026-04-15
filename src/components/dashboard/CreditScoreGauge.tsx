"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface CreditScoreGaugeProps {
  score: number;
  rating: string;
}

export function CreditScoreGauge({ score, rating }: CreditScoreGaugeProps) {
  // Normalize score for the gauge (assuming 300 to 1000 range)
  const min = 300;
  const max = 1000;
  const percentage = Math.min(100, Math.max(0, ((score - min) / (max - min)) * 100));

  const getIcon = () => {
    if (score >= 800) return <ShieldCheck className="w-8 h-8 text-primary" />;
    if (score >= 600) return <Shield className="w-8 h-8 text-yellow-500" />;
    return <ShieldAlert className="w-8 h-8 text-red-500" />;
  };

  const getColor = () => {
    if (score >= 800) return "text-primary";
    if (score >= 600) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Integrity Score</p>
        <div className="flex items-baseline gap-2">
            <h3 className={`text-5xl font-black font-heading ${getColor()}`}>{score}</h3>
            <span className="text-xs font-bold text-slate-400 capitalize">/ {max}</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>{rating} Reliability</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden titanium-border p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full rounded-full ${score >= 800 ? "bg-primary" : score >= 600 ? "bg-yellow-500" : "bg-red-500"}`}
          />
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2">
          Keep your transaction health high by settling debts within 24 hours to boost your score.
        </p>
      </div>
    </div>
  );
}
