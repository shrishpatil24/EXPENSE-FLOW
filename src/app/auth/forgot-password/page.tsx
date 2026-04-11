"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, ShieldCheck, Globe } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(37,99,235,0.2),transparent)]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          
          <Link href="/" className="flex items-center gap-2 relative z-10">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black font-heading tracking-tighter">EXPENSEFLOW</span>
          </Link>

          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl font-black font-heading leading-tight">
              Regain your<br />
              <span className="text-primary">Access.</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Secure password recovery</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            Designed for Collaborative Living
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black font-heading text-slate-900">Forgot Password</h1>
              <p className="text-slate-500 font-medium">Enter your email and your new desired password to regain access.</p>
            </div>

            <div className="grid gap-4">
              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
                  <Input type="email" placeholder="name@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white" />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold leading-relaxed shadow-sm">
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-[11px] font-bold leading-relaxed shadow-sm">
                    {success}
                  </motion.div>
                )}

                <Button type="submit" className="w-full h-14 primary-gradient text-lg rounded-2xl shadow-xl shadow-primary/20" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </div>

            <p className="text-center text-slate-500 text-sm font-medium">
              Remembered your password?{" "}
              <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4 transition-all">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
