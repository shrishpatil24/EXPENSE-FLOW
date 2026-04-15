"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2, DollarSign, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  _id: string;
  type: "EXPENSE" | "SETTLEMENT";
  description: string;
  amount: number;
  groupName: string;
  userName: string;
  date: string;
  isOwnAction: boolean;
}

interface RecentActivityFeedProps {
  transactions: Transaction[];
  loading: boolean;
}

export function RecentActivityFeed({ transactions, loading }: RecentActivityFeedProps) {
  return (
    <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full titanium-border min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black font-heading text-slate-900">Recent Pulse</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Group Activity</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-xl">
           <Clock className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-2xl bg-slate-100 animate-pulse" />
          ))
        ) : transactions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {transactions.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border transition-all hover:shadow-sm ${
                  t.isOwnAction ? "bg-white border-primary/20" : "bg-white border-slate-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === "EXPENSE" ? "bg-red-50" : "bg-emerald-50"
                  }`}>
                    {t.type === "EXPENSE" ? (
                      <DollarSign className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {t.userName} <span className="font-normal text-slate-500">in</span> {t.groupName}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(t.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">{t.description}</p>
                    <div className="flex justify-between items-center">
                       <span className={`text-xs font-black ${t.type === "EXPENSE" ? "text-red-500" : "text-emerald-500"}`}>
                        {t.type === "EXPENSE" ? "-" : "+"} ₹{t.amount.toLocaleString()}
                      </span>
                      {t.isOwnAction && (
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
            <Clock className="w-12 h-12 mb-4" />
            <p className="text-sm font-bold">No recent pulses detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
