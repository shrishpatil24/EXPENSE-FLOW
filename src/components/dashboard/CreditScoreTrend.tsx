"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Clock } from "lucide-react";

interface CreditPoint {
  newScore: number;
  timestamp: string;
  reason: string;
  delta: number;
}

export function CreditScoreTrend() {
  const [history, setHistory] = useState<CreditPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/user/credit-history");
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return <div className="h-64 bg-slate-50 animate-pulse rounded-3xl" />;
  if (history.length === 0) return null;

  const points = history.map(h => h.newScore);
  const min = Math.min(...points, 300);
  const max = Math.max(...points, 1000);
  const range = max - min || 1;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Score Progress</h4>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            <Award className="w-3 h-3" />
            Reliability Timeline
        </div>
      </div>

      <div className="h-24 w-full flex items-end gap-1 px-1 relative">
        {history.map((h, i) => {
          const h_pct = ((h.newScore - min) / range) * 80 + 20; // 20% to 100% height
          return (
            <div key={i} className="flex-1 group relative flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h_pct}%` }}
                className={`w-full rounded-t-sm transition-colors ${h.delta > 0 ? 'bg-primary/20 group-hover:bg-primary' : 'bg-red-500/20 group-hover:bg-red-500'}`}
              />
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform z-10 origin-bottom">
                 <div className="bg-slate-900 text-white text-[8px] font-bold p-2 rounded-lg shadow-xl whitespace-nowrap">
                    <div className="text-primary">{h.delta > 0 ? `+${h.delta}` : h.delta} Points</div>
                    <div className="text-slate-400">{h.reason}</div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Milestones</h5>
        <div className="space-y-2">
            {history.slice(-3).reverse().map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${h.delta > 0 ? 'bg-primary' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold text-slate-700">{h.reason}</span>
                    </div>
                    <span className={`text-[10px] font-black ${h.delta > 0 ? 'text-primary' : 'text-red-500'}`}>
                        {h.delta > 0 ? `+${h.delta}` : h.delta}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
