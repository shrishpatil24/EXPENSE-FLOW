"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Plus, Users, ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
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
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black font-heading text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Manage your shared groups and balances.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="h-14 px-8">
            <Plus className="w-5 h-5 mr-2" />
            Create New Group
          </Button>
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] grayscale transition-all group-hover:scale-110">
              <ArrowUpRight className="w-32 h-32 text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Receivable</p>
            <h3 className="text-4xl font-black font-heading text-primary">$0.00</h3>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] grayscale transition-all group-hover:scale-110">
              <ArrowDownLeft className="w-32 h-32 text-slate-900" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Payable</p>
            <h3 className="text-4xl font-black font-heading text-slate-900">$0.00</h3>
          </div>
        </section>

        {/* Groups List */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-heading text-slate-900 ml-2">Active Groups</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-40 rounded-3xl animate-pulse bg-slate-900/50" />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groups.map((group: any) => (
                <Link key={group._id} href={`/dashboard/groups/${group._id}`}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 rounded-3xl titanium-border h-full flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center titanium-border">
                        <Users className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-slate-500">{group.members?.length} members</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-20 rounded-3xl titanium-border text-center">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Groups Yet</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Create your first group to start splitting expenses with your team.</p>
              <Button onClick={() => setShowCreate(true)} variant="secondary">Initialize First Group</Button>
            </div>
          )}
        </section>
      </main>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-10 rounded-3xl titanium-border relative"
          >
            <h2 className="text-2xl font-black font-heading text-slate-900 mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <Input 
                  placeholder="Trip to Goa, Rent, etc." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Create Group</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
