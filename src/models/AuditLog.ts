import mongoose, { Schema, Document } from "mongoose";

export interface IAuditField {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface IAuditLog extends Document {
  expenseId: mongoose.Types.ObjectId;
  editedBy: mongoose.Types.ObjectId;
  changes: IAuditField[];
  timestamp: Date;
  reason?: string;
}

const AuditFieldSchema = new Schema<IAuditField>(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const AuditLogSchema = new Schema<IAuditLog>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: "Expense", required: true, index: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: [AuditFieldSchema],
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
  },
  { timestamps: false }
);

AuditLogSchema.index({ expenseId: 1, timestamp: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
