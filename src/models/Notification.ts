import mongoose, { Schema, Document } from "mongoose";
import "./User";

export type NotificationType =
  | "NEW_EXPENSE"
  | "ADDED_TO_GROUP"
  | "DEBT_REMINDER"
  | "SETTLEMENT_COMPLETED"
  | "CREDIT_SCORE_UPDATE";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, any>; // groupId, expenseId etc.
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["NEW_EXPENSE", "ADDED_TO_GROUP", "DEBT_REMINDER", "SETTLEMENT_COMPLETED", "CREDIT_SCORE_UPDATE"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for fast per-user unread queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
