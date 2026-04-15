/**
 * Transaction Manager — ACID-like lifecycle for settlements and expenses.
 *
 * Lifecycle:
 *  INITIATED → PENDING → LOCKED → COMMITTED
 *                                → FAILED → ROLLED_BACK
 *
 * Uses optimistic locking (version field) to prevent concurrent writes.
 */

import TransactionModel, { ITransaction } from "@/models/Transaction";

export class TransactionManager {
  /**
   * Phase 1: Initiate a new transaction and persist the payload snapshot.
   */
  static async initiate(
    type: "SETTLEMENT" | "EXPENSE",
    groupId: string,
    initiatedBy: string,
    payload: Record<string, any>
  ): Promise<ITransaction> {
    const txn = await TransactionModel.create({
      type,
      groupId,
      initiatedBy,
      payload,
      status: "INITIATED",
      log: [{ status: "INITIATED", message: "Transaction initiated", timestamp: new Date() }],
    });
    return txn;
  }

  /**
   * Phase 2: Move to PENDING — pre-condition checks done.
   */
  static async toPending(txnId: string): Promise<ITransaction | null> {
    return TransactionModel.findOneAndUpdate(
      { _id: txnId, status: "INITIATED" },
      {
        $set: { status: "PENDING" },
        $inc: { version: 1 },
        $push: { log: { status: "PENDING", message: "Pre-conditions verified", timestamp: new Date() } },
      },
      { new: true }
    );
  }

  /**
   * Phase 3: LOCK — reserve resources, prevent other txns from interfering.
   */
  static async lock(txnId: string, version: number): Promise<ITransaction | null> {
    // Optimistic lock: only proceeds if version hasn't changed (no concurrent update)
    return TransactionModel.findOneAndUpdate(
      { _id: txnId, status: "PENDING", version },
      {
        $set: { status: "LOCKED", lockedAt: new Date() },
        $inc: { version: 1 },
        $push: { log: { status: "LOCKED", message: "Resources locked", timestamp: new Date() } },
      },
      { new: true }
    );
  }

  /**
   * Phase 4: COMMIT — actual DB write already done, mark as committed.
   */
  static async commit(txnId: string, version: number): Promise<ITransaction | null> {
    return TransactionModel.findOneAndUpdate(
      { _id: txnId, status: "LOCKED", version },
      {
        $set: { status: "COMMITTED", committedAt: new Date() },
        $inc: { version: 1 },
        $push: { log: { status: "COMMITTED", message: "Transaction committed successfully", timestamp: new Date() } },
      },
      { new: true }
    );
  }

  /**
   * FAIL — mark as failed before attempting rollback.
   */
  static async fail(txnId: string, reason: string): Promise<void> {
    await TransactionModel.findByIdAndUpdate(txnId, {
      $set: { status: "FAILED" },
      $inc: { version: 1 },
      $push: { log: { status: "FAILED", message: `Failed: ${reason}`, timestamp: new Date() } },
    });
  }

  /**
   * ROLLBACK — restore state from the payload snapshot.
   * The caller is responsible for executing the actual DB reversal.
   * This marks the transaction as rolled back and logs it.
   */
  static async rollback(txnId: string, rollbackReason: string): Promise<ITransaction | null> {
    return TransactionModel.findByIdAndUpdate(
      txnId,
      {
        $set: { status: "ROLLED_BACK" },
        $inc: { version: 1 },
        $push: {
          log: {
            status: "ROLLED_BACK",
            message: `Rolled back: ${rollbackReason}`,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  /**
   * Detect deadlocks: find any LOCKED transaction for the same group older than 30s.
   */
  static async hasDeadlock(groupId: string, excludeTxnId: string): Promise<boolean> {
    const thirtySecondsAgo = new Date(Date.now() - 30_000);
    const staleLock = await TransactionModel.findOne({
      groupId,
      status: "LOCKED",
      lockedAt: { $lt: thirtySecondsAgo },
      _id: { $ne: excludeTxnId },
    });
    return !!staleLock;
  }

  /**
   * Resolve deadlock by rolling back the stale transaction.
   */
  static async resolveDeadlock(groupId: string, excludeTxnId: string): Promise<void> {
    const thirtySecondsAgo = new Date(Date.now() - 30_000);
    await TransactionModel.updateMany(
      {
        groupId,
        status: "LOCKED",
        lockedAt: { $lt: thirtySecondsAgo },
        _id: { $ne: excludeTxnId },
      },
      {
        $set: { status: "ROLLED_BACK" },
        $push: {
          log: {
            status: "ROLLED_BACK",
            message: "Rolled back due to deadlock detection",
            timestamp: new Date(),
          },
        },
      }
    );
  }
}
