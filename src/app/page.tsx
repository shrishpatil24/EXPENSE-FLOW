"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  Radio,
  Layers,
  LineChart,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 * i,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.25rem] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-white/60">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black font-heading tracking-tight">
              EXPENSE<span className="text-gradient-brand">FLOW</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/auth/login"
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline"
            >
              Sign in
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="rounded-xl px-5 shadow-md">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-[4.25rem]">
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
              <div className="lg:col-span-6 space-y-8 relative z-10">
                <motion.div
                  custom={0}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Badge tone="primary" className="pl-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Live balances · SSE
                  </Badge>
                  <Badge tone="neutral">MongoDB + Next.js 16</Badge>
                </motion.div>

                <motion.h1
                  custom={1}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="text-[2.65rem] sm:text-6xl lg:text-[4.25rem] font-black font-heading leading-[0.95] tracking-tight"
                >
                  Split bills{" "}
                  <span className="text-gradient-brand">without</span> the spreadsheet trauma.
                </motion.h1>

                <motion.p
                  custom={2}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl"
                >
                  Fair shares, simplified settlements, and a ledger that stays in sync when your
                  roommates add expenses — built for real groups, not demo data.
                </motion.p>

                <motion.div
                  custom={3}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  <Link href="/auth/register" className="sm:w-auto w-full">
                    <Button className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-2xl w-full sm:w-auto shadow-xl shadow-primary/20">
                      Open your ledger
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="sm:w-auto w-full">
                    <Button
                      variant="secondary"
                      className="h-14 sm:h-16 px-8 rounded-2xl w-full sm:w-auto"
                    >
                      I already have an account
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  custom={4}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm text-slate-500 font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> JWT-secured API
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-500" /> Live group stream
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-500" /> ACID settlement writes
                  </span>
                </motion.div>
              </div>

              <div className="lg:col-span-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 28, rotateX: 8 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="relative perspective-1000"
                >
                  <div className="absolute -inset-6 rounded-[2.75rem] bg-gradient-to-br from-primary/15 via-indigo-400/8 to-transparent blur-3xl opacity-80 motion-safe:animate-pulse motion-reduce:animate-none" />
                  <div className="live-ring-wrap rounded-[2rem]">
                    <div className="live-ring-inner overflow-hidden rounded-[calc(2rem-1px)] p-px shadow-2xl">
                  <Card className="relative rounded-[1.65rem] border-0 bg-white/85 shadow-none">
                    <div className="surface-inset rounded-[1.55rem] p-6 sm:p-8 space-y-6 border-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Active workspace
                          </p>
                          <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight mt-1">
                            Spring trip · Lisbon
                          </h3>
                        </div>
                        <div className="shrink-0 rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/15">
                          <Users className="text-primary w-6 h-6" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="surface-card rounded-2xl p-4 border border-emerald-100/80 bg-gradient-to-br from-emerald-50/80 to-white">
                          <p className="text-[10px] font-bold uppercase text-emerald-700/80 tracking-widest">
                            You are owed
                          </p>
                          <p className="text-2xl sm:text-3xl font-black font-heading text-emerald-700 tabular-amount mt-1">
                            ₹420.50
                          </p>
                        </div>
                        <div className="surface-card rounded-2xl p-4 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            You owe
                          </p>
                          <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tabular-amount mt-1">
                            ₹85.20
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Recent activity
                        </p>
                        {[
                          { name: "Groceries · equal split", amt: "₹120.00", icon: Zap },
                          {
                            name: "Settlement · UPI",
                            amt: "₹200.00",
                            icon: ArrowUpRight,
                            tone: "text-emerald-600",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800 truncate text-sm">
                                {item.name}
                              </span>
                            </div>
                            <span
                              className={`font-black font-heading text-sm tabular-amount shrink-0 ${item.tone ?? "text-slate-900"}`}
                            >
                              {item.amt}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <LineChart className="w-4 h-4 text-primary" />
                          Simplified settlement paths
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </Card>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 border-t border-slate-200/60 bg-gradient-to-b from-white/40 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
              <Badge tone="neutral" className="mb-4">
                Why it feels different
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">
                Precision tools, wrapped in a calm interface.
              </h2>
              <p className="mt-4 text-slate-600 font-medium text-lg">
                Less noise. Fewer taps. Numbers you can trust when rent week hits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {[
                {
                  title: "Penny-safe splits",
                  desc: "Equal, exact, percentage, or shares — totals stay consistent with sensible rounding.",
                  icon: PieChart,
                },
                {
                  title: "Fewer payments",
                  desc: "Greedy simplification suggests the minimum transfers to zero the group.",
                  icon: TrendingDown,
                },
                {
                  title: "Security-first",
                  desc: "Password hashing, JWT sessions, and MongoDB-backed persistence you can explain in a report.",
                  icon: Shield,
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <Card
                    variant="interactive"
                    className="p-8 sm:p-10 h-full flex flex-col gap-5 rounded-[1.75rem]"
                  >
                    <div className="w-14 h-14 rounded-2xl primary-gradient-soft flex items-center justify-center ring-1 ring-primary/10">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-black font-heading text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed flex-1">
                      {feature.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary">
                      Learn in app <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Card className="relative overflow-hidden p-10 sm:p-14 rounded-[2rem] border-primary/10 bg-gradient-to-br from-primary/[0.07] via-white to-indigo-50/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <h3 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight">
                    Ready when your group is.
                  </h3>
                  <p className="text-slate-600 font-medium text-lg">
                    Create a workspace in under a minute. No credit card theater — just sign up and
                    split.
                  </p>
                </div>
                <Link href="/auth/register" className="shrink-0 w-full lg:w-auto">
                  <Button className="h-14 px-10 text-lg rounded-2xl w-full lg:w-auto shadow-xl shadow-primary/25">
                    Start for free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <footer className="py-12 border-t border-slate-200/70 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-md">
                <Wallet className="text-white w-4 h-4" />
              </div>
              <span className="text-sm font-black font-heading tracking-tight text-slate-900">
                EXPENSEFLOW
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-md">
              Academic / portfolio build. Stack: Next.js 16, React 19, MongoDB, Mongoose, Tailwind
              CSS v4, Framer Motion.
            </p>
            <p className="text-slate-400 text-xs font-semibold">© 2026</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
