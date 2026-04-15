/**
 * Utility to calculate transaction health based on age and amount.
 * Health determines how "urgent" a debt is and impacts the user's credit score.
 */

export interface HealthImpact {
  health: number; // 0 to 100
  status: "HEALTHY" | "AGING" | "URGENT" | "CRITICAL";
  color: string;
  creditImpact: number; // Theoretical deduction if unpaid
}

export class TransactionHealth {
  private static readonly GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly DECAY_RATE_PER_DAY = 5; // 5% drop every 24h after grace period

  /**
   * Calculates current health of a debt.
   * @param createdAt - The timestamp when the debt was created
   */
  static calculate(createdAt: Date | string): HealthImpact {
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    const diff = now - createdDate;

    if (diff <= this.GRACE_PERIOD_MS) {
      return {
        health: 100,
        status: "HEALTHY",
        color: "#10b981", // emerald-500
        creditImpact: 0
      };
    }

    const daysOverGrace = (diff - this.GRACE_PERIOD_MS) / (24 * 60 * 60 * 1000);
    const health = Math.max(0, 100 - (daysOverGrace * this.DECAY_RATE_PER_DAY));

    let status: HealthImpact["status"] = "HEALTHY";
    let color = "#10b981";
    let creditImpact = 0;

    if (health < 20) {
      status = "CRITICAL";
      color = "#ef4444"; // red-500
      creditImpact = -50;
    } else if (health < 50) {
      status = "URGENT";
      color = "#f97316"; // orange-500
      creditImpact = -20;
    } else if (health < 80) {
      status = "AGING";
      color = "#eab308"; // yellow-500
      creditImpact = -5;
    }

    return {
      health: parseFloat(health.toFixed(2)),
      status,
      color,
      creditImpact
    };
  }

  /**
   * Summarizes user's overall financial health based on all active debts.
   */
  static getOverallStatus(currentScore: number) {
    if (currentScore >= 900) return "Excellent";
    if (currentScore >= 750) return "Good";
    if (currentScore >= 600) return "Average";
    return "Poor";
  }
}
