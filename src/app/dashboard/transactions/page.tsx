"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Activity, Search, RefreshCw, Send, DollarSign, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const initGroupId = searchParams.get("groupId") || "";
  const defaultAmount = searchParams.get("amount") || "";
  const toUserId = searchParams.get("toUserId") || "";

  const [debts, setDebts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  // Payment Interface State
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
     amount: defaultAmount,
     groupId: initGroupId,
     toId: toUserId,
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [dRes, eRes, gRes] = await Promise.all([
          fetch("/api/user/debts", { headers }),
          fetch("/api/transactions/recent", { headers }),
          fetch("/api/groups", { headers })
      ]);

      const [dData, eData, gData] = await Promise.all([
          dRes.json(),
          eRes.ok ? eRes.json() : { transactions: [] },
          gRes.ok ? gRes.json() : { groups: [] }
      ]);

      setDebts(dData.debts || []);
      setRecentTransactions(eData.transactions || []);
      setGroups(gData.groups || []);
      
      // Auto-set groupId for payment if we have groups but no initial group
      if (!initGroupId && gData.groups?.length > 0) {
          setPaymentData(prev => ({ ...prev, groupId: gData.groups[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [initGroupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!paymentData.groupId || !paymentData.amount) {
          alert("Please select a group and an amount");
          return;
      }

      setSubmittingPayment(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settlements", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
             groupId: paymentData.groupId,
             toId: paymentData.toId || "UNKNOWN_FOR_NOW", // This needs genuine toId
             amount: Number(paymentData.amount)
          }),
        });
        
        if (res.ok) {
           setPaymentData({ amount: "", groupId: paymentData.groupId, toId: "" });
           setShowPaymentSuccess(true);
           setTimeout(() => setShowPaymentSuccess(false), 3000);
           fetchData();
        } else {
           const errData = await res.json();
           alert(errData.error || "Failed to process payment");
        }
      } catch (err) {
          console.error(err);
      } finally {
          setSubmittingPayment(false);
      }
  };

  // Automatically find members of the selected group for the "To" dropdown
  const selectedGroup = groups.find((g: any) => g._id === paymentData.groupId);

  return (
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12 isolate font-sans">
        
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl tracking-tight text-[#001D39] font-bold">
               Transactions
            </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
            
            {/* Left Column (Payment Interface) */}
            <div className="lg:col-span-5 space-y-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#BDD8E9]/40 relative text-[#0A4174]">
                    <div className="flex items-center justify-between mb-8">
                         <h2 className="text-2xl font-bold text-[#0A4174]">Send Payment</h2>
                         <div className="w-12 h-12 rounded-full bg-[#BDD8E9]/30 flex items-center justify-center">
                              <Send className="w-6 h-6 text-[#0A4174]" />
                         </div>
                    </div>

                    {showPaymentSuccess && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 font-semibold text-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            Payment Sent Successfully!
                        </div>
                    )}

                    <form onSubmit={handleSendPayment} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-[#49769F] ml-1">Payment Amount</label>
                           <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                   <DollarSign className="text-[#6EA2B3] w-5 h-5" />
                               </div>
                               <Input 
                                 type="number"
                                 min="1"
                                 step="0.01"
                                 placeholder="0.00" 
                                 value={paymentData.amount}
                                 onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                 required 
                                 className="pl-12 py-6 text-xl rounded-2xl bg-[#FAFAFA] border-[#BDD8E9]/50 focus:bg-white text-[#001D39] font-bold shadow-inner"
                               />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-[#49769F] ml-1">Which Group?</label>
                           <select 
                               className="w-full h-12 px-4 rounded-xl bg-[#FAFAFA] border border-[#BDD8E9]/50 text-[#0A4174] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#6EA2B3]/50"
                               value={paymentData.groupId}
                               onChange={(e) => setPaymentData({ ...paymentData, groupId: e.target.value, toId: "" })}
                               required
                           >
                               <option value="" disabled>Select Group</option>
                               {groups.map((group: any) => (
                                   <option key={group._id} value={group._id}>{group.name}</option>
                               ))}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-[#49769F] ml-1">To Whom?</label>
                           <select 
                               className="w-full h-12 px-4 rounded-xl bg-[#FAFAFA] border border-[#BDD8E9]/50 text-[#0A4174] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#6EA2B3]/50"
                               value={paymentData.toId}
                               onChange={(e) => setPaymentData({ ...paymentData, toId: e.target.value })}
                               required
                           >
                               <option value="" disabled>Select Member</option>
                               {selectedGroup?.members?.map((member: any) => (
                                   <option key={member._id} value={member._id}>{member.name || member.email}</option>
                               ))}
                           </select>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={submittingPayment} 
                            className="w-full py-6 text-lg rounded-2xl bg-[#0A4174] text-white hover:bg-[#001D39] shadow-md transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            {submittingPayment ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                            {submittingPayment ? "Processing..." : "Send Payment"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Column (Recent Transaction History) */}
            <div className="lg:col-span-7 space-y-6">
                
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[#0A4174] text-xl font-bold border-b-2 border-[#4E8EA2] pb-1">Payment History</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6EA2B3]" />
                        <Input 
                            placeholder="Search..." 
                            className="w-48 pl-9 h-10 rounded-full border-[#BDD8E9]/50 bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((txn, idx) => (
                            <div key={txn.id || txn._id || idx} className="flex justify-between items-center bg-white border border-[#BDD8E9]/40 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition cursor-default">
                                <div className="flex items-center gap-5">
                                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'expense' ? 'bg-[#BDD8E9]/40 text-[#49769F]' : 'bg-[#4E8EA2]/20 text-[#0A4174]'}`}>
                                      {txn.type === 'expense' ? <Activity className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
                                   </div>
                                   <div>
                                       <p className="font-bold text-[#0A4174] text-[16px] leading-tight">
                                           {txn.type === 'expense' ? txn.description : `Settled with ${txn.toName || txn.fromName}`}
                                       </p>
                                       <p className="text-[13px] text-[#49769F] font-semibold mt-1">
                                          {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} • {txn.groupName}
                                       </p>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                   <span className={`font-black text-lg ${txn.type === 'expense' ? 'text-[#0A4174]' : 'text-emerald-600'}`}>
                                      {txn.type === 'expense' ? '-' : '+'} ₹ {txn.amount.toFixed(2)}
                                   </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-[#49769F] bg-white rounded-3xl border border-[#BDD8E9]/30">
                           <Activity className="w-12 h-12 mx-auto text-[#BDD8E9] mb-3" />
                           <p className="font-medium text-lg">No recent transactions to display.</p>
                           <p className="text-sm mt-1 opacity-80">Payments you send or receive will appear here.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>

      </main>
  );
}

export default function TransactionsPage() {
    return (
        <div className="flex flex-col w-full bg-[#FAFAFA] min-h-screen text-[#001D39]">
          <DashboardNav />
          <Suspense fallback={<div className="p-10 font-bold text-center">Loading interface...</div>}>
            <TransactionsContent />
          </Suspense>
        </div>
    );
}