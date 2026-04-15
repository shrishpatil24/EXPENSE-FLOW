"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { Plus, Users, ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreditScoreTrend } from "@/components/dashboard/CreditScoreTrend";
import { CreditScoreGauge } from "@/components/dashboard/CreditScoreGauge";

export default function Dashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [creditData, setCreditData] = useState({ score: 1000, rating: "Excellent" });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [gRes, dRes, cRes] = await Promise.all([
          fetch("/api/groups", { headers }),
          fetch("/api/user/debts", { headers }),
          fetch("/api/user/credit-history", { headers })
      ]);

      const [gData, dData, cData] = await Promise.all([
          gRes.json(),
          dRes.json(),
          cRes.json()
      ]);

      setGroups(gData.groups || []);
      setDebts(dData.debts || []);
      setCredits(dData.credits || []);
      setCreditData({ score: cData.currentScore, rating: cData.rating });
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGroup(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (res.ok) {
        setNewGroupName("");
        setShowCreate(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingGroup(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchData();
      }
    }, 45000);
    const onVis = () => {
      if (document.visibilityState === "visible") void fetchData();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchData]);

  const totalPayable = debts.reduce((acc, d) => acc + d.amount, 0);
  const totalReceivable = credits.reduce((acc, c) => acc + c.amount, 0);
  const syncLabel =
    lastSyncedAt?.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) ?? "—";

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {debts.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-red-100/80 bg-gradient-to-r from-red-50/90 to-orange-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center ring-1 ring-red-200/50">
                        <ArrowUpRight className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                        <Badge tone="danger" className="mb-2">Action needed</Badge>
                        <h4 className="text-base font-black font-heading text-red-950">Outstanding balances</h4>
                        <p className="text-sm text-red-800/90 font-medium mt-0.5">You owe <span className="font-black tabular-amount text-red-950">₹{totalPayable.toFixed(2)}</span> across groups.</p>
                    </div>
                </div>
              </Card>
            </motion.div>
        )}

        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">Dashboard</h1>
              <Badge tone="neutral" className="tabular-nums">
                {clock.toLocaleTimeString()} · synced {syncLabel}
              </Badge>
            </div>
            <p className="text-slate-600 font-medium max-w-xl">Groups, receivables, and payables in one place. Data refreshes when you focus this tab or every 45 seconds.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="h-14 px-8 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            New group
          </Button>
        </section>

        {/* Credit & Info Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreditScoreGauge score={creditData.score} rating={creditData.rating} />
          </div>
          <div className="lg:col-span-2">
            <CreditScoreTrend />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <Card className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.06] transition-transform duration-500 group-hover:scale-110">
              <ArrowUpRight className="w-36 h-36 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total receivable</p>
            <motion.h3
              key={totalReceivable}
              initial={{ opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-4xl sm:text-5xl font-black font-heading text-gradient-brand tabular-amount"
            >
              ₹{totalReceivable.toFixed(2)}
            </motion.h3>
            <p className="text-xs text-slate-500 font-semibold mt-3">What others owe you</p>
          </Card>
          <Card className="p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.05] transition-transform duration-500 group-hover:scale-110">
              <ArrowDownLeft className="w-36 h-36 text-slate-800" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total payable</p>
            <motion.h3
              key={totalPayable}
              initial={{ opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tabular-amount"
            >
              ₹{totalPayable.toFixed(2)}
            </motion.h3>
            <p className="text-xs text-slate-500 font-semibold mt-3">What you owe others</p>
          </Card>
        </section>

        {/* Actionable Alerts (Requested Narrative Style) */}
        {debts.length > 0 && (
            <section className="space-y-4">
                <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">For you</h2>
                <div className="grid grid-cols-1 gap-4">
                    {debts.map((debt, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 28 }}
                        >
                          <Card variant="interactive" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary/10 bg-gradient-to-r from-primary/[0.06] to-white">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-2xl primary-gradient-soft flex items-center justify-center ring-1 ring-primary/15 shrink-0">
                                    <ArrowUpRight className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Pay <span className="font-black text-primary">{debt.toName}</span>
                                        <span className="text-slate-500 font-medium"> · {debt.groupName}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        <span className="font-black text-slate-900 tabular-amount text-base">₹{debt.amount}</span>
                                    </p>
                                </div>
                            </div>
                            <Link href={`/dashboard/groups/${debt.groupId}`} className="shrink-0">
                                <Button size="sm" variant="secondary" className="rounded-xl h-11 px-6 w-full sm:w-auto border-primary/10">Open group</Button>
                            </Link>
                          </Card>
                        </motion.div>
                    ))}
                </div>
            </section>
        )}

        {/* Groups List */}
        <section className="space-y-5">
          <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">Your groups</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="surface-card h-44 rounded-[1.75rem] animate-pulse bg-slate-100/80 border-slate-200/80" />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {groups.map((group: any) => (
                <Link key={group._id} href={`/dashboard/groups/${group._id}`}>
                  <motion.div 
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <Card variant="interactive" className="p-6 h-full flex flex-col justify-between min-h-[11rem] group cursor-pointer">
                    <div className="flex justify-between items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl primary-gradient flex items-center justify-center shadow-md shadow-primary/20 ring-2 ring-white/50">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-black font-heading text-slate-900 mb-1 tracking-tight">{group.name}</h3>
                      <Badge tone="neutral">{group.members?.length ?? 0} members</Badge>
                    </div>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-16 sm:p-20 text-center border-dashed border-2 border-slate-200/80 bg-slate-50/30">
              <Users className="w-14 h-14 text-slate-400 mx-auto mb-5" />
              <h3 className="text-xl font-black font-heading text-slate-900 mb-2">No groups yet</h3>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Spin up a workspace for rent, trips, or projects — everyone sees the same ledger.</p>
              <Button onClick={() => setShowCreate(true)} variant="secondary" className="rounded-xl">Create first group</Button>
            </Card>
          )}
        </section>
      </main>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-backdrop z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="modal-panel max-w-md"
          >
            <h2 className="text-2xl font-black font-heading text-slate-900 mb-6 tracking-tight">Create group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <Input 
                  placeholder="Trip to Goa, Rent, etc." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1" disabled={creatingGroup}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={creatingGroup}>{creatingGroup ? "Creating…" : "Create Group"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
