import mongoose, { Schema, Document } from "mongoose";
import "./User";
export enum SplitType {
  EQUAL = "EQUAL",
  PERCENTAGE = "PERCENTAGE",
  EXACT = "EXACT",
  SHARES = "SHARES",
}

interface ISplit {
  userId: mongoose.Types.ObjectId;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface IExpense extends Document {
  description: string;
  amount: number;
  groupId: mongoose.Types.ObjectId;
  paidBy: mongoose.Types.ObjectId;
  splitType: SplitType;
  splits: ISplit[];
  date: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SplitSchema = new Schema<ISplit>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number },
  shares: { type: Number },
}, { _id: false });

const ExpenseSchema = new Schema<IExpense>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitType: {
      type: String,
      enum: Object.values(SplitType),
      default: SplitType.EQUAL,
    },
    splits: [SplitSchema],
    date: { type: Date, default: Date.now },
    category: { type: String, default: "General" },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes: prefix match on groupId via compound; text search on ledger fields
ExpenseSchema.index({ groupId: 1, date: -1 });
ExpenseSchema.index({ description: "text", category: "text" });

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
