import mongoose, { Schema, Document } from "mongoose";
import "./User";

export interface ICreditHistory extends Document {
  userId: mongoose.Types.ObjectId;
  previousScore: number;
  newScore: number;
  delta: number; // positive = increase, negative = decrease
  reason: string;
  timestamp: Date;
}

const CreditHistorySchema = new Schema<ICreditHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    previousScore: { type: Number, required: true },
    newScore: { type: Number, required: true },
    delta: { type: Number, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

CreditHistorySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.CreditHistory ||
  mongoose.model<ICreditHistory>("CreditHistory", CreditHistorySchema);
