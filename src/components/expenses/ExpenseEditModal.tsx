"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";

interface ExpenseEditModalProps {
  expense: {
    _id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function ExpenseEditModal({ expense, onClose, onUpdate }: ExpenseEditModalProps) {
  const [formData, setFormData] = useState({
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: new Date(expense.date).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/expenses/${expense._id}/edit`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(await res.text());
      
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Edit Expense</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Description</label>
              <input 
                type="text"
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Amount</label>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                    <input 
                        type="number"
                        required
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    />
                </div>
                </div>
                <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Category</label>
                <input 
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Date</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-lg shadow-primary/20"
            >
              {loading ? "Updating..." : <><Save className="w-4 h-4" /> Update Expense</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
