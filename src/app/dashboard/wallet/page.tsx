"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Wallet, TrendingUp, CreditCard, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { CreditScoreTrend } from "@/components/dashboard/CreditScoreTrend";

export default function WalletPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [dRes, eRes] = await Promise.all([
          fetch("/api/user/debts", { headers }),
          fetch("/api/transactions/recent", { headers })
      ]);

      const [dData, eData] = await Promise.all([
          dRes.json(),
          eRes.ok ? eRes.json() : { transactions: [] }
      ]);

      setDebts(dData.debts || []);
      setCredits(dData.credits || []);
      setRecentTransactions(eData.transactions || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const totalPayable = debts.reduce((acc, d) => acc + d.amount, 0);
  const totalReceivable = credits.reduce((acc, c) => acc + c.amount, 0);
  const balance = totalReceivable - totalPayable;
  
  const userObj = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const firstName = (userObj.name || userObj.email || "Rachel").split(" ")[0];

  return (
    <div className="flex flex-col w-full bg-[#FAFAFA] min-h-screen text-[#001D39]">
      <DashboardNav />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 md:px-12 space-y-10 font-sans">
        
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl tracking-tight text-[#001D39] font-bold">
               My Wallet
            </h1>
        </header>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#0A4174] to-[#001D39] rounded-[2rem] p-10 shadow-lg relative overflow-hidden text-white flex flex-col justify-between min-h-[260px]">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#49769F]/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div>
                <p className="text-[#BDD8E9] font-medium mb-2 opacity-90 tracking-wide uppercase text-sm">Main Account Balance</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-bold opacity-80">₹</span>
                   <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                     {balance >= 0 ? balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00"}
                   </h2>
                </div>
            </div>
            
            <div className="flex justify-between items-end mt-8">
               <div className="space-y-1">
                   <p className="text-[#6EA2B3] text-sm tracking-wide font-medium uppercase">Card Holder</p>
                   <p className="font-semibold text-lg tracking-wide">{firstName} ExpenseFlow</p>
               </div>
               <div className="flex items-center justify-center gap-1.5 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                   <div className="w-6 h-6 rounded-full bg-[#7BBDE8] z-10 opacity-95 mix-blend-screen" />
                   <div className="w-6 h-6 rounded-full bg-white -ml-3 z-0 opacity-90 mix-blend-screen" />
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="bg-white rounded-[2rem] shadow-sm border border-[#BDD8E9]/30 p-8 space-y-6">
                <h3 className="font-bold text-[#0A4174] text-xl flex items-center gap-2">
                    <TrendingUp className="text-[#4E8EA2] w-5 h-5" /> 
                    Receivables
                </h3>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">
                    + ₹ {totalReceivable.toLocaleString()}
                </div>
                <p className="text-sm text-[#49769F] font-medium leading-relaxed">
                    Total amount expected to flow back into your wallet from friends and groups.
                </p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-[#BDD8E9]/30 p-8 space-y-6">
                <h3 className="font-bold text-[#0A4174] text-xl flex items-center gap-2">
                    <CreditCard className="text-red-400 w-5 h-5" /> 
                    Payables
                </h3>
                <div className="text-3xl font-black text-red-500 tracking-tight">
                    - ₹ {totalPayable.toLocaleString()}
                </div>
                <p className="text-sm text-[#49769F] font-medium leading-relaxed">
                    Total amount you currently owe to others across all groups.
                </p>
                <Link href="/dashboard/transactions" className="inline-block mt-4">
                    <Button className="bg-[#0A4174] hover:bg-[#001D39] text-white rounded-xl shadow-md border-0 transition-colors">
                        Settle Debts
                    </Button>
                </Link>
            </div>
        </div>

      </main>
    </div>
  );
}
