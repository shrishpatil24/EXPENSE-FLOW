import mongoose, { Schema, Document } from "mongoose";

export interface ILedgerAudit extends Document {
  groupId: mongoose.Types.ObjectId;
  action: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const LedgerAuditSchema = new Schema<ILedgerAudit>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LedgerAuditSchema.index({ groupId: 1, createdAt: -1 });

export default mongoose.models.LedgerAudit ||
  mongoose.model<ILedgerAudit>("LedgerAudit", LedgerAuditSchema);
