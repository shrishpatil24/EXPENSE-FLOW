"use client";

import { Wallet, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardNav() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <nav className="glass-card border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center primary-gradient">
          <Wallet className="text-primary-foreground w-5 h-5" />
        </div>
        <span className="text-xl font-bold font-heading text-slate-900 tracking-tighter">
          EXPENSE<span className="text-primary">FLOW</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer group">
          <User className="w-5 h-5 group-hover:text-primary" />
          <span className="text-sm font-bold hidden sm:inline">Profile</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
