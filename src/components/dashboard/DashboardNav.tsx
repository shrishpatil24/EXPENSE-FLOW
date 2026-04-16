"use client";

import { LogOut, Wallet, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export function DashboardNav() {
  const pathname = usePathname();
  const [initials, setInitials] = useState<string>("EF");
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };
      const dRes = await fetch("/api/user/debts", { headers });
      const dData = await dRes.json();
      
      const debts = dData.debts || [];
      const credits = dData.credits || [];
      
      setTotalPayable(debts.reduce((acc: number, d: any) => acc + d.amount, 0));
      setTotalReceivable(credits.reduce((acc: number, c: any) => acc + c.amount, 0));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const name = u.name || u.email || "User";
        const p = name.split(" ");
        setInitials(p.length > 1 ? p[0][0] + p[1][0] : p[0][0]);
      }
    } catch {}
  }, [fetchData]);

  const budgetRemaining = 15000 - totalPayable;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* Full-width Top Nav Bar */}
      <header className="bg-[#111111] text-slate-300 w-full relative z-40 border-b border-white/5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/dashboard" className="flex items-center gap-2 group relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[8px] flex items-center justify-center p-1.5 shadow-md">
                  <Wallet className="w-full h-full text-white" />
                </div>
                <span className="font-bold text-white tracking-tight text-lg">ExpenseFlow</span>
              </Link>
              <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm relative z-10">
                <Link href="/dashboard" className={`relative transition-colors ${pathname === '/dashboard' ? 'text-white' : 'hover:text-white'}`}>
                  Dashboard
                  {pathname === '/dashboard' && <span className="absolute -bottom-[25px] left-0 w-full h-[2px] bg-white rounded-t-full"></span>}
                </Link>
                <Link href="/dashboard/transactions" className={`relative transition-colors ${pathname === '/dashboard/transactions' ? 'text-white' : 'hover:text-white'}`}>
                  Transactions
                  {pathname === '/dashboard/transactions' && <span className="absolute -bottom-[25px] left-0 w-full h-[2px] bg-white rounded-t-full"></span>}
                </Link>
                <Link href="/dashboard/wallet" className={`relative transition-colors ${pathname === '/dashboard/wallet' ? 'text-white' : 'hover:text-white'}`}>
                  Wallet
                  {pathname === '/dashboard/wallet' && <span className="absolute -bottom-[25px] left-0 w-full h-[2px] bg-white rounded-t-full"></span>}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold text-xs uppercase overflow-hidden shrink-0 border border-slate-700">
                  {initials || "EF"}
              </div>
              <button className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><Settings className="w-5 h-5"/></button>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-2 hover:bg-white/5 rounded-full transition-colors"><LogOut className="w-5 h-5"/></button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Analytics Pill */}
      <div className="w-full max-w-[1600px] mx-auto px-6 pt-6 pb-2 relative z-10">
        <div className="w-full flex justify-center pb-2 relative">
          <div className="absolute inset-0 max-w-4xl mx-auto h-[50px] top-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 blur-xl pointer-events-none"></div>
          <div className="bg-[#1A1A1A] border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-full px-8 py-3.5 flex flex-wrap items-center justify-between gap-6 text-sm font-semibold w-full max-w-5xl relative z-10 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-6 lg:gap-10 flex-1 relative z-10 text-center">
               <div className="flex flex-col items-center flex-1">
                 <span className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-0.5">Total Payable</span>
                 <div className="flex items-center text-red-400 text-lg sm:text-sidebar font-bold tracking-tight">
                   ₹ {totalPayable.toLocaleString()}
                 </div>
               </div>
               
               <div className="w-[1px] h-10 bg-white/10 hidden lg:block"></div>

               <div className="flex flex-col items-center flex-1">
                 <span className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-0.5">Total Receivable</span>
                 <div className="flex items-center text-emerald-400 text-lg sm:text-sidebar font-bold tracking-tight">
                   ₹ {totalReceivable.toLocaleString()}
                 </div>
               </div>

               <div className="w-[1px] h-10 bg-white/10 hidden lg:block"></div>

               <div className="flex flex-col items-center flex-1">
                 <span className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-0.5">Remaining Budget</span>
                 <div className="flex items-center text-blue-400 text-lg sm:text-sidebar font-bold tracking-tight">
                   ₹ {budgetRemaining.toLocaleString()}
                 </div>
               </div>
            </div>
            
            <div className="hidden sm:flex items-center justify-center gap-4 bg-black/40 p-3 rounded-full w-56 border border-white/5 relative z-10 shadow-inner">
               <div className="w-full space-y-1.5 px-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span className="tracking-wide">Usage limit</span>
                    <span>{Math.max(0, Math.min(100, Math.round((totalPayable/15000)*100)))}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                       style={{width: `${Math.max(0, Math.min(100, (totalPayable/15000)*100))}%`}} 
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
