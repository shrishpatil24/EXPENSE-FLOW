"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, DollarSign, UserPlus, TrendingUp, TrendingDown, X } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Notifications fetch failed", err);
    }
  }

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/all/read", { method: "DELETE" }); // Note: I used DELETE for bulk read in route earlier
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
        console.error(err);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_EXPENSE": return <DollarSign className="w-3 h-3 text-blue-500" />;
      case "ADDED_TO_GROUP": return <UserPlus className="w-3 h-3 text-green-500" />;
      case "SETTLEMENT_COMPLETED": return <CheckCircle2 className="w-3 h-3 text-primary" />;
      case "CREDIT_SCORE_UPDATE": return <TrendingUp className="w-3 h-3 text-purple-500" />;
      default: return <Bell className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-slate-400 italic">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => !n.isRead && markRead(n._id)}
                      className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                 <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                    Close
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
