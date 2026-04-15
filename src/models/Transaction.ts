import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus =
  | "INITIATED"
  | "PENDING"
  | "LOCKED"
  | "COMMITTED"
  | "FAILED"
  | "ROLLED_BACK";

export interface ITransactionLog {
  status: TransactionStatus;
  message: string;
  timestamp: Date;
}

export interface ITransaction extends Document {
  status: TransactionStatus;
  type: "SETTLEMENT" | "EXPENSE";
  groupId: mongoose.Types.ObjectId;
  initiatedBy: mongoose.Types.ObjectId;
  payload: Record<string, any>; // Snapshot of data to commit
  log: ITransactionLog[];
  version: number; // Optimistic locking
  lockedAt?: Date;
  committedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionLogSchema = new Schema<ITransactionLog>(
  {
    status: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    status: {
      type: String,
      enum: ["INITIATED", "PENDING", "LOCKED", "COMMITTED", "FAILED", "ROLLED_BACK"],
      default: "INITIATED",
    },
    type: { type: String, enum: ["SETTLEMENT", "EXPENSE"], required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    log: [TransactionLogSchema],
    version: { type: Number, default: 0 }, // Incremented on each state change
    lockedAt: { type: Date },
    committedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to detect concurrency conflicts
TransactionSchema.index({ groupId: 1, status: 1 });
TransactionSchema.index({ initiatedBy: 1, createdAt: -1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
