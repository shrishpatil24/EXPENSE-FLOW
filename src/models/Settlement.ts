import mongoose, { Schema, Document } from "mongoose";
import "./User";
export interface ISettlement extends Document {
  fromId: mongoose.Types.ObjectId;
  toId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  status: "PENDING" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
  {
    fromId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "COMPLETED",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settlement || mongoose.model<ISettlement>("Settlement", SettlementSchema);
