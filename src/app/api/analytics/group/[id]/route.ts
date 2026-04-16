import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

/**
 * GET /api/analytics/group/[id]
 * Returns MongoDB aggregation analytics for a group:
 *  - Total spent per category
 *  - Monthly spending trend (last 6 months)
 *  - Per-user contribution (who paid how much)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: groupId } = await params;

    const [categoryTotals, monthlyTrend, perUserContribution] = await Promise.all([
      // 1. Total spend by category
      Expense.aggregate([
        { $match: { groupId: { $toString: groupId } } },
        {
          $group: {
            _id: { $ifNull: ["$category", "General"] },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $project: { category: "$_id", totalAmount: 1, count: 1, _id: 0 } },
      ]),

      // 2. Monthly trend (last 6 months)
      Expense.aggregate([
        {
          $match: {
            groupId: { $toString: groupId },
            date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",
            totalAmount: 1,
            count: 1,
            _id: 0,
          },
        },
      ]),

      // 3. Per-user contribution (paidBy totals)
      Expense.aggregate([
        { $match: { groupId: { $toString: groupId } } },
        {
          $group: {
            _id: "$paidBy",
            totalPaid: { $sum: "$amount" },
            expenseCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: "$_id",
            name: { $ifNull: ["$user.name", "Unknown"] },
            totalPaid: 1,
            expenseCount: 1,
            _id: 0,
          },
        },
        { $sort: { totalPaid: -1 } },
      ]),
    ]);

    return NextResponse.json(
      { categoryTotals, monthlyTrend, perUserContribution },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
