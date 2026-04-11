"use client";

import { Wallet, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function DashboardNav() {
  const router = useRouter();
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw) as { name?: string; email?: string };
      setUserLabel(u.name || u.email || null);
    } catch {
      setUserLabel(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-nav sticky top-0 z-40 relative px-4 sm:px-6 py-3.5 flex items-center justify-between"
    >
      <span className="nav-live-line" aria-hidden />
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 group min-w-0"
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-white/50">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm"
            title="Session active"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-black font-heading text-slate-900 tracking-tight leading-none truncate">
            EXPENSE<span className="text-gradient-brand">FLOW</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5 hidden sm:block">
            Ledger
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        {userLabel && (
          <div className="hidden sm:flex items-center gap-2 max-w-[200px] rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-sm">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-slate-700 truncate">
              {userLabel}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}
