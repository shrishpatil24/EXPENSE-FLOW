"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, Users, Activity } from "lucide-react";

interface AnalyticsData {
  categoryTotals: { category: string; totalAmount: number; count: number }[];
  monthlyTrend: { year: number; month: number; totalAmount: number; count: number }[];
  perUserContribution: { userId: string; name: string; totalPaid: number; expenseCount: number }[];
}

export function GroupAnalytics({ groupId }: { groupId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics/group/${groupId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [groupId]);

  if (loading) return <div className="animate-pulse bg-slate-50 h-64 rounded-3xl" />;
  if (!data) return null;

  const maxSpend = Math.max(...data.categoryTotals.map(c => c.totalAmount), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Spend by Category</h4>
          </div>
          <div className="space-y-4">
            {data.categoryTotals.map((cat, i) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{cat.category}</span>
                  <span className="text-slate-400">₹{cat.totalAmount}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.totalAmount / maxSpend) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Top Payers</h4>
          </div>
          <div className="space-y-4">
            {data.perUserContribution.map((user, i) => (
              <div key={user.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{user.name}</span>
                    <span className="text-primary">₹{user.totalPaid}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{user.expenseCount} payments made</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Monthly Trend Mini-Chart (SVG) */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Spending Trend (6m)</h4>
        </div>
        
        <div className="h-32 w-full relative flex items-end gap-2 px-2">
            {data.monthlyTrend.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500">No data found</div>
            ) : (
                data.monthlyTrend.map((month, i) => {
                    const maxMonthly = Math.max(...data.monthlyTrend.map(m => m.totalAmount), 1);
                    const h = (month.totalAmount / maxMonthly) * 80; // 80% max height
                    return (
                        <div key={`${month.year}-${month.month}`} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-t-sm relative"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] font-bold bg-white text-slate-900 px-1 rounded shadow-sm transition-opacity">
                                    ₹{month.totalAmount}
                                </div>
                            </motion.div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">
                                {new Date(2000, month.month-1).toLocaleString('default', { month: 'short' })}
                            </span>
                        </div>
                    )
                })
            )}
        </div>
      </div>
    </div>
  );
}
