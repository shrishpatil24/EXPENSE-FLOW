"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, User, ArrowRight, Clock } from "lucide-react";

interface AuditLog {
  _id: string;
  editedBy: { name: string; email: string };
  changes: { field: string; oldValue: any; newValue: any }[];
  timestamp: string;
}

export function AuditTrailView({ expenseId }: { expenseId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/expenses/${expenseId}/audit`);
        const data = await res.json();
        setLogs(data.auditLogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (expenseId) fetchAudit();
  }, [expenseId]);

  if (loading) return <div className="space-y-4 animate-pulse">
    {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
  </div>;

  if (logs.length === 0) return (
    <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
      <History className="w-8 h-8 text-slate-200 mx-auto mb-2" />
      <p className="text-xs text-slate-400">No edits recorded for this expense.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Expense History</h4>
      </div>
      
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-100 before:to-transparent">
        {logs.map((log, idx) => (
          <div key={log._id} className="relative flex items-start gap-4">
            <div className="mt-1.5 w-10 h-10 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shrink-0 z-10 shadow-sm">
                <User className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-700">{log.editedBy.name} edited the expense</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                {log.changes.map((change, ci) => (
                  <div key={ci} className="bg-slate-50/50 p-2 rounded-lg text-[10px] flex items-center gap-3">
                    <span className="font-bold text-slate-500 uppercase w-16">{change.field}</span>
                    <span className="text-slate-400 line-through">₹{change.oldValue}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-primary">₹{change.newValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
