/**
 * Notification Engine — Creates in-app notifications for users.
 */

import Notification, { NotificationType } from "@/models/Notification";

/**
 * Creates a notification for a single user.
 */
export async function createNotification(
  userId: string,
  message: string,
  type: NotificationType,
  metadata?: Record<string, any>
): Promise<void> {
  await Notification.create({ userId, message, type, metadata });
}

/**
 * Creates the same notification for multiple users (e.g. all group members).
 */
export async function notifyMany(
  userIds: string[],
  message: string,
  type: NotificationType,
  metadata?: Record<string, any>
): Promise<void> {
  const docs = userIds.map((userId) => ({ userId, message, type, metadata }));
  await Notification.insertMany(docs);
}

/**
 * Pre-built notification builders for common events.
 */
export const NotificationTemplates = {
  newExpense: (groupName: string, amount: number, paidByName: string) =>
    `💸 ${paidByName} added an expense of ₹${amount} in "${groupName}"`,

  addedToGroup: (groupName: string, addedByName: string) =>
    `👋 ${addedByName} added you to the group "${groupName}"`,

  debtReminder: (amount: number, toName: string, groupName: string) =>
    `⏰ Reminder: You owe ₹${amount} to ${toName} in "${groupName}"`,

  settlementCompleted: (amount: number, fromName: string) =>
    `✅ ${fromName} paid you ₹${amount}. Your credit score has been updated.`,

  creditScoreUpdate: (delta: number, newScore: number) =>
    delta > 0
      ? `📈 Your credit score improved by ${delta} points → ${newScore}`
      : `📉 Your credit score dropped by ${Math.abs(delta)} points → ${newScore}`,
};
