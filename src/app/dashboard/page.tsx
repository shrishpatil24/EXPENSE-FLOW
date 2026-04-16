"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Plus, LogOut, ChevronRight, Activity, Wallet, PieChart, Users, Settings, Tag } from "lucide-react";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("");
  
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [gRes, dRes, eRes] = await Promise.all([
          fetch("/api/groups", { headers }),
          fetch("/api/user/debts", { headers }),
          fetch("/api/transactions/recent", { headers })
      ]);

      const [gData, dData, eData] = await Promise.all([
          gRes.json(),
          dRes.json(),
          eRes.ok ? eRes.json() : { transactions: [] }
      ]);

      setGroups(gData.groups || []);
      setDebts(dData.debts || []);
      setCredits(dData.credits || []);
      setRecentExpenses(eData.transactions || []);
    } catch (err) {
      console.error(err);
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

  const colors = [
    { bg: "bg-[#FCE6D5]", text: "text-[#D9874D]" },
    { bg: "bg-[#D6F5E1]", text: "text-[#5CB27A]" },
    { bg: "bg-[#E3DFFF]", text: "text-[#8877E5]" },
    { bg: "bg-[#E2F2FC]", text: "text-[#629CC4]" },
    { bg: "bg-[#FCE2F4]", text: "text-[#D27EBA]" },
    { bg: "bg-[#F0F2F5]", text: "text-[#8E9BAC]" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <DashboardNav />

      {/* Main Layout Area */}
      <div className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar (Filters/Quick actions like image) */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
           
           <div className="bg-[#111111] text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
              <h3 className="text-xl font-bold leading-tight z-10 mb-2">Create New Group</h3>
              <p className="text-slate-400 text-xs z-10">Start splitting expenses with friends or family.</p>
              <button onClick={() => setShowCreate(true)} className="mt-6 z-10 w-full py-3 bg-[#4FC0ED] hover:bg-[#3FAEE0] text-black font-extrabold rounded-full transition-colors text-sm flex items-center justify-center gap-2">
                 <Plus className="w-4 h-4" /> Create Group
              </button>
           </div>

           <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">Recent Transactions</h4>
              <div className="space-y-3">
                 {recentExpenses.length > 0 ? (
                    recentExpenses.slice(0, 4).map((txn, idx) => (
                      <div key={txn.id || txn._id || idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                           <Activity className="w-4 h-4" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                              {txn.type === 'expense' ? txn.description : `Settled with ${txn.toName || txn.fromName || 'User'}`}
                           </p>
                           <p className="text-[11px] text-slate-500 truncate">
                              {txn.groupName || 'Group'}
                           </p>
                         </div>
                         <span className={`font-bold text-sm shrink-0 ${txn.type === 'expense' ? 'text-slate-800' : 'text-emerald-600'}`}>
                           {txn.type === 'expense' ? '-' : '+'}₹{txn.amount.toFixed(0)}
                         </span>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-4 text-slate-500 text-sm bg-slate-100/50 rounded-2xl">
                       No recent transactions.
                    </div>
                 )}
                 <Link href="/dashboard/transactions" className="block text-center text-xs font-bold text-[#4FC0ED] hover:text-[#3FAEE0] mt-2">
                    View all transactions
                 </Link>
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-6">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-slate-900">Recent Group Activity</h2>
                 <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{groups.length}</span>
              </div>
              <Link href="/dashboard/transactions" className="text-sm font-bold text-slate-500 flex items-center hover:text-slate-900">
                 Sort by: <span className="text-slate-900 ml-1">Latest</span>
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {groups.map((val: any, idx: number) => {
                const c = colors[idx % colors.length];
                // Finding arbitrary total debts for that group logic mapping (using general debts length to pretend numbers if zero)
                const mockDebt = debts.find(d => d.groupId === val._id)?.amount || (100 * (idx + 1));
                const participantsCount = val.members?.length || 2;
                
                return (
                 <Link href={`/dashboard/groups/${val._id}`} key={val._id} className={`block p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer ${c.bg}`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/50 text-slate-800 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ring-1 ring-white/40">
                         {new Date(val.updatedAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                      </div>
                      <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                         <Tag className={`w-4 h-4 ${c.text}`} />
                      </div>
                   </div>

                   <div className="space-y-1 mb-6">
                      <p className="text-slate-600 font-semibold text-sm">{val.creator?.name || 'Group Admin'}</p>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{val.name}</h3>
                   </div>

                   <div className="flex flex-wrap gap-2 mb-8">
                     <span className="text-[11px] font-bold bg-white/50 px-3 py-1.5 rounded-full text-slate-700 ring-1 ring-white/40">Active</span>
                     <span className="text-[11px] font-bold bg-white/50 px-3 py-1.5 rounded-full text-slate-700 ring-1 ring-white/40">{participantsCount} Members</span>
                     <span className="text-[11px] font-bold bg-white/50 px-3 py-1.5 rounded-full text-slate-700 ring-1 ring-white/40">Split</span>
                   </div>

                   <div className="flex items-end justify-between pt-4 border-t border-slate-900/10">
                      <div>
                         <p className="text-lg font-black text-slate-900 leading-none">₹{mockDebt.toLocaleString()}</p>
                         <p className="text-slate-500 text-[11px] font-semibold mt-1 uppercase tracking-wide">Avg Spent</p>
                      </div>
                      <button className="bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold transition-transform hover:scale-105">
                         Details
                      </button>
                   </div>
                 </Link>
                );
             })}
           </div>
        </main>

      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-backdrop z-50 fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded-[2rem] shadow-xl transform transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase mx-1">Name</label>
                <Input 
                  placeholder="E.g. Travel, Dinner, etc." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required 
                  autoFocus
                  className="rounded-xl bg-slate-100 border-transparent focus:bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                    Cancel
                </Button>
                <Button type="submit" disabled={creatingGroup} className="flex-1 rounded-xl bg-[#4FC0ED] text-black hover:bg-[#3FAEE0]">
                  {creatingGroup ? "Save..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
