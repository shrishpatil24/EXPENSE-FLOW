"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Users, ArrowLeft, Receipt, 
  TrendingUp, Calculator, UserPlus, 
  CheckCircle2, DollarSign, Trash2, AlertTriangle, Settings
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [settleData, setSettleData] = useState({ toId: "", amount: "" });
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitType: "EQUAL",
  });

  // Split Calculator State
  const [calcAmount, setCalcAmount] = useState("");
  const [calcPeople, setCalcPeople] = useState("");

  const fetchData = async () => {
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

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
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
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleSettleUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          fromId: storedUser.id,
          toId: settleData.toId,
          groupId,
          amount: parseFloat(settleData.amount)
        }),
      });
      if (res.ok) {
        setSettleData({ toId: "", amount: "" });
        setShowSettleModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
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
    fetchData();
  }, [groupId]);

  if (loading || !group) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Breadcrumbs & Header */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black font-heading text-slate-900">{group.name}</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Invite Participant
            </Button>
            <Button variant="secondary" onClick={() => setShowSettleModal(true)}>
              <DollarSign className="w-4 h-4 mr-2" /> Settle Up
            </Button>
            <Button onClick={() => setShowExpenseModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Transaction
            </Button>
            <Button variant="secondary" className="px-3 border-red-100 hover:bg-red-50 text-red-500" onClick={handleDeleteGroup}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Balances & Members */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Individual Balances
              </h3>
              <div className="space-y-4">
                {balances?.individualBalances?.map((bal: any) => (
                  <div key={bal.userId} className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{bal.name}</span>
                    <span className={`font-bold ${bal.netBalance >= 0 ? "text-primary" : "text-slate-900 opacity-60"}`}>
                      {bal.netBalance >= 0 ? `+ ₹${bal.netBalance}` : `- ₹${Math.abs(bal.netBalance)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Simplified Settlements
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
            </div>

            {/* Split Calculator */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-20 h-20" />
              </div>
              
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Multi-Split Calculator
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
            </div>
          </div>

          {/* Right: Expense Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold font-heading text-slate-900 ml-2">Transaction History</h2>
            <div className="space-y-4">
              {expenses.length > 0 ? (
                expenses.map((expense: any) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={expense._id} 
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${expense.type === 'SETTLEMENT' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                        {expense.type === 'SETTLEMENT' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <Receipt className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold">{expense.description}</h4>
                        <p className="text-[10px] text-slate-400">
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
                        <p className={`text-xl font-black font-heading ${expense.type === 'SETTLEMENT' ? 'text-green-600' : 'text-slate-900'}`}>
                            {expense.type === 'SETTLEMENT' ? '' : '₹ '} {expense.amount}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      {expense.type === 'EXPENSE' && (
                        <button 
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center bg-white border border-slate-100 rounded-3xl opacity-50">
                  <Receipt className="w-10 h-10 mx-auto mb-4" />
                  <p className="font-bold text-slate-400">No transactions recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-sm p-10 rounded-3xl titanium-border">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6">Invite Member</h2>
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
                   <Button type="button" variant="secondary" onClick={() => setShowMemberModal(false)} className="flex-1">Cancel</Button>
                   <Button type="submit" className="flex-1">Send Invite</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-10 rounded-3xl titanium-border">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6">Record Expense</h2>
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
                    className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-900 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={expenseData.paidBy}
                    onChange={(e) => setExpenseData({...expenseData, paidBy: e.target.value})}
                  >
                    {group.members.map((m: any) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5 pt-6">
                   <Button type="button" variant="secondary" onClick={() => setShowExpenseModal(false)} className="flex-1">Back</Button>
                   <Button type="submit" className="flex-1">Split <DollarSign className="w-4 h-4 ml-1"/></Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showSettleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-sm p-10 rounded-3xl titanium-border">
              <h2 className="text-2xl font-black font-heading text-slate-900 mb-6">Settle Up</h2>
              <form onSubmit={handleSettleUp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-[10px]">Who did you pay?</label>
                  <select 
                    className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-900 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={settleData.toId}
                    onChange={(e) => setSettleData({...settleData, toId: e.target.value})}
                    required
                  >
                    <option value="">Select a member...</option>
                    {group.members.map((m: any) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
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
                   <Button type="button" variant="secondary" onClick={() => setShowSettleModal(false)} className="flex-1">Cancel</Button>
                   <Button type="submit" className="flex-1">Confirm Payment</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
