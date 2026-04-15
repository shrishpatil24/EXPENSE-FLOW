"use client";

import { useCallback, useEffect, useState } from "react";
import { useGroupLedgerStream } from "@/hooks/useGroupLedgerStream";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Plus, ArrowLeft, Receipt, 
  TrendingUp, Calculator, UserPlus, 
  CheckCircle2, DollarSign, Trash2, Settings
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GroupAnalytics } from "@/components/groups/GroupAnalytics";
import { ExpenseEditModal } from "@/components/expenses/ExpenseEditModal";
import { AuditTrailView } from "@/components/expenses/AuditTrailView";
import { History, ShieldCheck } from "lucide-react";

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [submittingSettle, setSubmittingSettle] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  
  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [settleData, setSettleData] = useState({ toId: "", amount: "" });
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showAuditId, setShowAuditId] = useState<string | null>(null);
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitType: "EQUAL",
  });

  // Split Calculator State
  const [calcAmount, setCalcAmount] = useState("");
  const [calcPeople, setCalcPeople] = useState("");

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      // Fetch Groups to get details
      const gRes = await fetch("/api/groups", { headers });
      const gData = await gRes.json();
      const currentGroup = gData.groups?.find((g: any) => g._id === groupId);
      setGroup(currentGroup);

      // Fetch Expenses & Settlements
      const [eRes, sRes, bRes] = await Promise.all([
        fetch(`/api/expenses?groupId=${groupId}`, { headers }),
        fetch(`/api/settlements?groupId=${groupId}`, { headers }),
        fetch(`/api/groups/${groupId}/balances`, { headers })
      ]);
      
      const [eData, sData, bData] = await Promise.all([
        eRes.json(),
        sRes.json(),
        bRes.json()
      ]);

      // Combine expenses and settlements for a unified ledger
      const unifiedTransactions = [
        ...(eData.expenses || []).map((e: any) => ({ ...e, type: "EXPENSE" })),
        ...(sData.settlements || []).map((s: any) => ({ 
            ...s, 
            type: "SETTLEMENT", 
            description: "Payment Settlement",
            paidBy: s.fromId // For consistent mapping in JS
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setExpenses(unifiedTransactions);
      setBalances(bData);

      // Set default payor
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setExpenseData(prev => ({ ...prev, paidBy: storedUser.id }));

      setLastSyncedAt(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setStreamToken(localStorage.getItem("token"));
  }, []);

  useGroupLedgerStream(
    typeof groupId === "string" ? groupId : undefined,
    streamToken,
    () => {
      void fetchData();
    }
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    setSubmittingMember(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newMemberName, email: newMemberEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setFeedback({ type: "success", message: "Member invited!" });
        setNewMemberName("");
        setNewMemberEmail("");
        setTimeout(() => {
            setShowMemberModal(false);
            setFeedback({ type: "", message: "" });
        }, 1500);
        fetchData();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to add member" });
      }
    } catch (err) { 
      console.error(err);
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExpense(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...expenseData,
          amount: parseFloat(expenseData.amount),
          groupId,
          participants: group.members.map((m: any) => ({ userId: m._id, value: 1 })) // Simplification: Default to equal split
        }),
      });
      if (res.ok) {
        setExpenseData({ description: "", amount: "", paidBy: "", splitType: "EQUAL" });
        setShowExpenseModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally {
      setSubmittingExpense(false);
    }
  };

  const handleSettleUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSettle(true);
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type: "SETTLEMENT",
          groupId,
          payload: {
            fromId: storedUser.id,
            toId: settleData.toId,
            amount: parseFloat(settleData.amount)
          }
        }),
      });
      if (res.ok) {
        setSettleData({ toId: "", amount: "" });
        setShowSettleModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally {
      setSubmittingSettle(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    
    setDeletingExpenseId(expenseId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
    finally {
      setDeletingExpenseId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure? This will delete the group and ALL transactions permanently.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) router.push("/dashboard");
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const syncLabel =
    lastSyncedAt?.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) ?? "—";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DashboardNav />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-slate-200/80 rounded-xl" />
          <div className="h-12 w-2/3 max-w-md bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-48 bg-slate-100 rounded-3xl border border-slate-200" />
              <div className="h-40 bg-slate-100 rounded-3xl border border-slate-200" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-100 rounded-3xl border border-slate-200"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DashboardNav />
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-600 font-medium">This group could not be loaded.</p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        <section className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight break-words">{group.name}</h1>
              <Badge tone="primary" className="tabular-nums">Live · {syncLabel}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowMemberModal(true)} className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" /> Invite
            </Button>
            <Button variant="secondary" onClick={() => setShowSettleModal(true)} className="rounded-xl">
              <DollarSign className="w-4 h-4 mr-2" /> Settle
            </Button>
            <Button onClick={() => setShowExpenseModal(true)} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add expense
            </Button>
            <Button variant="secondary" className="px-3 rounded-xl border-red-100 hover:bg-red-50 text-red-600" onClick={handleDeleteGroup} title="Delete group">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Group Analytics Dashboard */}
        <section className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-slate-900 ml-2">Insights & Distribution</h2>
            <GroupAnalytics groupId={groupId as string} />
        </section>

        <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Balances & Members */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Balances
              </h3>
              <div className="space-y-4">
                {balances?.individualBalances?.map((bal: any, idx: number) => {
                  const roleObj = group.roles?.find((r: any) => r.userId === bal.userId);
                  return (
                    <motion.div
                      layout
                      key={bal.userId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-medium">{bal.name}</span>
                        {roleObj?.role === "ADMIN" && (
                          <div className="flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </div>
                        )}
                      </div>
                      <motion.span
                        layout
                        key={`${bal.userId}-${bal.netBalance}`}
                        initial={{ scale: 1.05, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        className={`font-bold ${bal.netBalance >= 0 ? "text-primary" : "text-slate-900 opacity-60"}`}
                      >
                        {bal.netBalance >= 0 ? `+ ₹${bal.netBalance}` : `- ₹${Math.abs(bal.netBalance)}`}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Simplified settlements
              </h3>
              <div className="space-y-3">
                {balances?.simplifiedDebts?.length > 0 ? (
                    balances.simplifiedDebts.map((debt: any, i: number) => {
                        const fromName = group.members.find((m: any) => m._id === debt.from)?.name;
                        const toName = group.members.find((m: any) => m._id === debt.to)?.name;
                        return (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1">
                                <p className="text-slate-500 font-medium"><span className="text-slate-900 font-bold">{fromName}</span> owes <span className="text-slate-900 font-bold">{toName}</span></p>
                                <p className="text-primary text-lg font-black tracking-tighter">₹ {debt.amount}</p>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-8 text-center bg-green-50 rounded-2xl border border-green-100">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                        <p className="text-green-600 font-bold text-sm">Balanced Ledger</p>
                    </div>
                )}
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-20 h-20" />
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Split calculator
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Total Bill Amount</label>
                  <Input 
                    type="number" 
                    placeholder="₹ 0.00" 
                    value={calcAmount} 
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Number of People</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5" 
                    value={calcPeople} 
                    onChange={(e) => setCalcPeople(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                
                {calcAmount && calcPeople && parseInt(calcPeople) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Each Person Pays</p>
                    <p className="text-3xl font-black font-heading text-primary">
                      ₹ {(parseFloat(calcAmount) / parseInt(calcPeople)).toFixed(2)}
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Expense Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">Ledger</h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl text-slate-600"
                onClick={() => void fetchData()}
              >
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              {expenses.length > 0 ? (
                expenses.map((expense: any, index: number) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={expense._id} 
                    className="ledger-row group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm ${expense.type === 'SETTLEMENT' ? 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100' : 'bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-100'}`}>
                        {expense.type === 'SETTLEMENT' ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        ) : (
                            <Receipt className="w-7 h-7 text-slate-500 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <Badge tone={expense.type === 'SETTLEMENT' ? 'success' : 'neutral'}>
                            {expense.type === 'SETTLEMENT' ? 'Settlement' : 'Expense'}
                          </Badge>
                        </div>
                        <h4 className="text-slate-900 font-black font-heading tracking-tight truncate">{expense.description}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            {expense.type === 'SETTLEMENT' ? (
                                <>Sent by <span className="text-slate-600 font-medium">{expense.fromId.name}</span></>
                            ) : (
                                <>Recorded by <span className="text-slate-600 font-medium">{expense.paidBy.name}</span></>
                            )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-xl sm:text-2xl font-black font-heading tabular-amount ${expense.type === 'SETTLEMENT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            ₹{expense.amount}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            type="button"
                            onClick={() => setShowAuditId(showAuditId === expense._id ? null : expense._id)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <History className="w-4 h-4" />
                        </button>
                        {expense.type === 'EXPENSE' && (
                          <>
                            <button 
                                onClick={() => setEditingExpense(expense)}
                                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <button 
                                type="button"
                                disabled={deletingExpenseId === expense._id}
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Inline Audit Trail */}
                  <AnimatePresence>
                    {showAuditId === expense._id && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden px-6 pb-6"
                        >
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                <AuditTrailView expenseId={expense._id} />
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </>
                ))
              ) : (
                <Card className="p-16 text-center border-dashed border-2 border-slate-200/80 bg-slate-50/20">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-black font-heading text-slate-500">No transactions yet</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Add an expense or settlement to populate the ledger.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
        </LayoutGroup>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="modal-backdrop z-50">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="modal-panel max-w-sm">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6 tracking-tight">Invite member</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                {feedback.message && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${feedback.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {feedback.message}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Member Name</label>
                  <Input placeholder="E.g. Shraa" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} autoFocus required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <Input type="email" placeholder="shraa@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required />
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100/10">
                   <Button type="button" variant="secondary" onClick={() => setShowMemberModal(false)} className="flex-1" disabled={submittingMember}>Cancel</Button>
                   <Button type="submit" className="flex-1" disabled={submittingMember}>{submittingMember ? "Sending…" : "Send Invite"}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showExpenseModal && (
          <div className="modal-backdrop z-50">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="modal-panel max-w-md">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6 tracking-tight">Record expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">What did you buy?</label>
                  <Input placeholder="Dinner, Taxi, etc." value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">Amount (₹)</label>
                  <Input type="number" placeholder="0.00" value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">Who paid?</label>
                  <select 
                    className="w-full h-12 rounded-xl bg-white border border-slate-200/90 text-slate-900 px-4 text-sm shadow-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/40 outline-none transition-all"
                    value={expenseData.paidBy}
                    onChange={(e) => setExpenseData({...expenseData, paidBy: e.target.value})}
                  >
                    {group.members.map((m: any, idx: number) => (
                      <option key={`${m._id}-${idx}`} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5 pt-6">
                   <Button type="button" variant="secondary" onClick={() => setShowExpenseModal(false)} className="flex-1" disabled={submittingExpense}>Back</Button>
                   <Button type="submit" className="flex-1" disabled={submittingExpense}>{submittingExpense ? "Recording…" : (<span className="inline-flex items-center">Split <DollarSign className="w-4 h-4 ml-1"/></span>)}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showSettleModal && (
          <div className="modal-backdrop z-50">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="modal-panel max-w-sm">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6 tracking-tight">Settle up</h2>
              <form onSubmit={handleSettleUp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">Who did you pay?</label>
                  <select 
                    className="w-full h-12 rounded-xl bg-white border border-slate-200/90 text-slate-900 px-4 text-sm shadow-sm focus:ring-2 focus:ring-primary/15 focus:border-primary/40 outline-none transition-all"
                    value={settleData.toId}
                    onChange={(e) => setSettleData({...settleData, toId: e.target.value})}
                    required
                  >
                    <option value="">Select a member...</option>
                    {group.members.map((m: any, idx: number) => (
                      <option key={`${m._id}-${idx}`} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">Amount Paid (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={settleData.amount} 
                    onChange={(e) => setSettleData({...settleData, amount: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                   <Button type="button" variant="secondary" onClick={() => setShowSettleModal(false)} className="flex-1" disabled={submittingSettle}>Cancel</Button>
                   <Button type="submit" className="flex-1" disabled={submittingSettle}>{submittingSettle ? "Confirming…" : "Confirm Payment"}</Button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}

        {editingExpense && (
          <ExpenseEditModal 
            expense={editingExpense} 
            onClose={() => setEditingExpense(null)} 
            onUpdate={fetchData} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
