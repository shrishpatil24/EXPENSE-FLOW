import { IExpense } from "@/models/Expense";
import { ISettlement } from "@/models/Settlement";

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}

export class SettlementEngine {
  /**
   * Simplifies debts within a group to minimize the number of transactions.
   * @param settlements - List of all settlements in the group
   * @param memberIds - List of all user IDs in the group
   * @returns Array of simplified transaction suggestions
   */
  static simplifyDebts(expenses: IExpense[], settlements: ISettlement[], memberIds: string[]): SimplifiedDebt[] {
    const balances: Record<string, number> = {};

    // Initialize balances
    memberIds.forEach((id) => (balances[id.toString()] = 0));

    // Calculate net balance for each member
    // PaidBy gets '+' amount, Debtors in 'splits' get '-' amount
    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();
      balances[payerId] += expense.amount;

      expense.splits.forEach((split) => {
        const debtorId = split.userId.toString();
        balances[debtorId] -= split.amount;
      });
    });

    // Incorporate Settlements (Payments)
    settlements.forEach((settlement) => {
        const from = settlement.fromId.toString();
        const to = settlement.toId.toString();
        balances[from] += settlement.amount; // Sender's liability decreases (credit)
        balances[to] -= settlement.amount;   // Receiver's asset decreases (debit)
    });

    // Filter out people with essentially 0 balance
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.keys(balances).forEach((id) => {
      const amount = parseFloat(balances[id].toFixed(2));
      if (amount < 0) {
        debtors.push({ id, amount: Math.abs(amount) });
      } else if (amount > 0) {
        creditors.push({ id, amount });
      }
    });

    // Greedy matching
    const transactions: SimplifiedDebt[] = [];
    let dIndex = 0;
    let cIndex = 0;

    while (dIndex < debtors.length && cIndex < creditors.length) {
      const debtor = debtors[dIndex];
      const creditor = creditors[cIndex];

      const settlement = Math.min(debtor.amount, creditor.amount);
      
      if (settlement > 0) {
        transactions.push({
          from: debtor.id,
          to: creditor.id,
          amount: parseFloat(settlement.toFixed(2)),
        });
      }

      debtor.amount -= settlement;
      creditor.amount -= settlement;

      if (debtor.amount <= 0) dIndex++;
      if (creditor.amount <= 0) cIndex++;
    }

    return transactions;
  }
}
