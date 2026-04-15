/**
 * Credit Engine — Manages credit score updates and writes history.
 * Call this after any settlement is completed or debt aging is detected.
 */

import User from "@/models/User";
import CreditHistory from "@/models/CreditHistory";

const SCORE_MIN = 300;
const SCORE_MAX = 1000;

interface CreditUpdateResult {
  previousScore: number;
  newScore: number;
  delta: number;
}

/**
 * Updates a user's credit score and persists a history record.
 * @param userId    MongoDB ObjectId string of the user
 * @param delta     Amount to change score by (positive = increase, negative = decrease)
 * @param reason    Human-readable reason e.g. "Settled debt on time"
 */
export async function updateCreditScore(
  userId: string,
  delta: number,
  reason: string
): Promise<CreditUpdateResult> {
  const user = await User.findById(userId).select("creditScore");
  if (!user) throw new Error(`User ${userId} not found`);

  const previousScore = user.creditScore;
  const rawNew = previousScore + delta;
  const newScore = Math.min(SCORE_MAX, Math.max(SCORE_MIN, rawNew));
  const actualDelta = newScore - previousScore;

  // Only persist if there's an actual change
  if (actualDelta !== 0) {
    user.creditScore = newScore;
    await user.save();

    await CreditHistory.create({
      userId,
      previousScore,
      newScore,
      delta: actualDelta,
      reason,
      timestamp: new Date(),
    });
  }

  return { previousScore, newScore, delta: actualDelta };
}

/**
 * Calculates the credit score delta for a settlement based on how late it was.
 * Faster settlements get bigger rewards.
 */
export function calculateSettlementDelta(debtCreatedAt: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const ageInDays = (Date.now() - new Date(debtCreatedAt).getTime()) / msPerDay;

  if (ageInDays <= 1) return 20;   // Settled within 24h: +20
  if (ageInDays <= 3) return 15;   // Within 3 days: +15
  if (ageInDays <= 7) return 10;   // Within a week: +10
  if (ageInDays <= 14) return 5;   // Within 2 weeks: +5
  return 2;                         // Late but settled: +2
}

/**
 * Calculates the credit score penalty for an unpaid overdue debt.
 * Called by a background job or on-demand debt check.
 */
export function calculateOverduePenalty(debtCreatedAt: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const ageInDays = (Date.now() - new Date(debtCreatedAt).getTime()) / msPerDay;

  if (ageInDays > 20) return -50;
  if (ageInDays > 10) return -20;
  if (ageInDays > 5) return -10;
  if (ageInDays > 2) return -5;
  return 0; // Within 2 days: no penalty yet
}
