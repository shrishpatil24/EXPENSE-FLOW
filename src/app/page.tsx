"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowRight, 
  Users, 
  Zap, 
  PieChart, 
  Shield, 
  ArrowUpRight,
  TrendingDown,
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black font-heading tracking-tighter text-slate-900">EXPENSEFLOW</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link href="/auth/register">
              <Button size="sm" className="px-6 rounded-xl">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100"
              >
                <div className="w-2 h-2 rounded-full animate-pulse bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Project Edition</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl lg:text-8xl font-black font-heading text-slate-900 leading-[0.9] tracking-tighter"
              >
                Shared living,<br />
                <span className="text-primary">perfectly balanced.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl"
              >
                The professional-grade expense tracker for students, roommates, and teams. Built for transparency, speed, and accuracy.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/auth/register">
                  <Button className="h-16 px-10 text-xl rounded-2xl shadow-2xl shadow-primary/20 w-full sm:w-auto">
                    Initialize Ledger <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="secondary" className="h-16 px-10 text-xl rounded-2xl border-slate-200 w-full sm:w-auto">
                  View Features
                </Button>
              </motion.div>

              <div className="flex items-center gap-8 pt-6 grayscale opacity-40">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 border-r border-slate-200 pr-8">Built With</span>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-sm">Next.js 15</span>
                  <span className="font-bold text-sm">MongoDB</span>
                  <span className="font-bold text-sm">Vercel</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-2 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10"
              >
                <div className="bg-slate-50 rounded-[2.5rem] p-8 lg:p-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400">Current Group</p>
                      <h3 className="text-2xl font-black font-heading text-slate-900 tracking-tighter">Room 402 - Spring 2024</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <Users className="text-primary w-6 h-6" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Receivable</p>
                      <p className="text-3xl font-black font-heading text-primary">₹420.50</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Payable</p>
                      <p className="text-3xl font-black font-heading text-slate-900">₹85.20</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400">Recent Transactions</p>
                     {[
                       { name: "Grocery Split", amount: "₹120.00", icon: <Zap className="w-4 h-4" /> },
                       { name: "Electricity Bill", amount: "₹85.50", icon: <ArrowUpRight className="w-4 h-4" /> }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                             {item.icon}
                           </div>
                           <span className="font-bold text-slate-900">{item.name}</span>
                         </div>
                         <span className="font-black font-heading text-slate-900">{item.amount}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full -z-10" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black font-heading text-slate-900 tracking-tight">Engineered for Accuracy.</h2>
            <p className="text-slate-500 font-medium">Built by students, for students. Every detail refined for usability.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Penny Correction",
                desc: "Our engine handles rounding errors automatically, ensuring group totals always match precisely.",
                icon: <PieChart className="w-6 h-6 text-primary" />
              },
              {
                title: "Optimized Settlement",
                desc: "Using the Greedy Matching algorithm to minimize the number of transactions needed to settle up.",
                icon: <TrendingDown className="w-6 h-6 text-primary" />
              },
              {
                title: "Institutional Security",
                desc: "JWT authentication and encrypted storage keep your financial data private and secure.",
                icon: <Shield className="w-6 h-6 text-primary" />
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-primary/5 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black font-heading text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-6">
           <div className="flex items-center gap-2">
            <div className="w-6 h-6 primary-gradient rounded flex items-center justify-center">
              <Wallet className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tighter text-slate-900">EXPENSEFLOW</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            Standard Academic Protocol 2.0
          </div>
          <p className="text-slate-400 text-xs font-medium">© 2024 Shrish Patil. Personal Academic Project.</p>
        </div>
      </footer>
    </div>
  );
}
