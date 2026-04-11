/**
 * Expense-Flow — labeled MongoDB queries (CO5)
 *
 * Run against the same database as your app (URI database segment sets `db`):
 *   mongosh "<MONGODB_URI>" --file scripts/expense-flow-queries.mjs
 *
 * Requires at least one group with one member (create via the UI first).
 * Cleans up temp docs tagged description: "RUBRIC_QUERY_TEMP".
 */

(function rubricQueries() {
  const sampleGroup = db.getCollection("groups").findOne();
  if (!sampleGroup || !sampleGroup.members || !sampleGroup.members.length) {
    print("Skip: need ≥1 group with ≥1 member. Seed via app, then re-run.");
    return;
  }

  const G = sampleGroup._id;
  const member = sampleGroup.members[0];

  // —— Q1 CREATE (insertOne) ——
  const q1 = db.getCollection("expenses").insertOne({
    description: "RUBRIC_QUERY_TEMP",
    amount: 42.5,
    groupId: G,
    paidBy: member,
    splitType: "EQUAL",
    splits: [{ userId: member, amount: 42.5 }],
    date: new Date(),
    category: "Food",
  });
  printjson({ label: "Q1_CREATE_insertOne", result: q1 });

  // —— Q2 READ (find + projection) ——
  const q2 = db
    .getCollection("expenses")
    .find({ groupId: G }, { description: 1, amount: 1, category: 1 })
    .limit(5)
    .toArray();
  printjson({ label: "Q2_READ_find_project_limit", count: q2.length, sample: q2[0] });

  // —— Q3 UPDATE ——
  const q3 = db.getCollection("expenses").updateOne(
    { description: "RUBRIC_QUERY_TEMP", groupId: G },
    { $set: { category: "Groceries" } }
  );
  printjson({ label: "Q3_UPDATE_updateOne", result: q3 });

  // —— Q4 COMPOUND INDEX (idempotent) ——
  const q4 = db.getCollection("expenses").createIndex({ groupId: 1, date: -1 });
  printjson({ label: "Q4_INDEX_compound_groupId_date", indexName: q4 });

  // —— Q5 TEXT INDEX + Q6 TEXT SEARCH ——
  try {
    db.getCollection("expenses").createIndex({ description: "text", category: "text" });
  } catch (e) {
    printjson({ label: "Q5_TEXT_index_note", msg: String(e) });
  }
  const q6 = db
    .getCollection("expenses")
    .find({ $text: { $search: "RUBRIC_QUERY_TEMP" } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(3)
    .toArray();
  printjson({ label: "Q6_SEARCH_text", matches: q6.length });

  // —— Q7 AGGREGATION — total by category for group ——
  const q7 = db
    .getCollection("expenses")
    .aggregate([
      { $match: { groupId: G } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ])
    .toArray();
  printjson({ label: "Q7_AGG_sum_by_category", rows: q7 });

  // —— Q8 AGGREGATION — monthly spend trend ——
  const q8 = db
    .getCollection("expenses")
    .aggregate([
      { $match: { groupId: G } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  printjson({ label: "Q8_AGG_monthly_trend", rows: q8 });

  // —— Q9 AGGREGATION — $lookup user name for payer ——
  const q9 = db
    .getCollection("expenses")
    .aggregate([
      { $match: { groupId: G } },
      { $sort: { date: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "paidBy",
          foreignField: "_id",
          as: "payer",
        },
      },
      { $unwind: { path: "$payer", preserveNullAndEmptyArrays: true } },
      { $project: { description: 1, amount: 1, payerName: "$payer.name" } },
    ])
    .toArray();
  printjson({ label: "Q9_AGG_lookup_payer", rows: q9 });

  // —— Q10 AGGREGATION — expenses + settlements via $unionWith ——
  const q10 = db
    .getCollection("expenses")
    .aggregate([
      { $match: { groupId: G } },
      { $project: { kind: { $literal: "EXPENSE" }, amount: 1, at: "$date" } },
      {
        $unionWith: {
          coll: "settlements",
          pipeline: [
            { $match: { groupId: G } },
            {
              $project: {
                kind: { $literal: "SETTLEMENT" },
                amount: 1,
                at: "$date",
              },
            },
          ],
        },
      },
      { $sort: { at: -1 } },
      { $limit: 8 },
    ])
    .toArray();
  printjson({ label: "Q10_AGG_union_ledger", rows: q10 });

  // —— Q11 PAGINATION (skip/limit) ——
  const q11 = db
    .getCollection("expenses")
    .find({ groupId: G })
    .sort({ date: -1 })
    .skip(0)
    .limit(2)
    .toArray();
  printjson({ label: "Q11_READ_pagination", count: q11.length });

  // —— Q12 DISTINCT categories ——
  const q12 = db.getCollection("expenses").distinct("category", { groupId: G });
  printjson({ label: "Q12_READ_distinct_categories", values: q12 });

  // —— Q13 DELETE (cleanup temp) ——
  const q13 = db.getCollection("expenses").deleteMany({ description: "RUBRIC_QUERY_TEMP" });
  printjson({ label: "Q13_DELETE_cleanup", result: q13 });

  print("\n--- SQL vs Mongo (cheat sheet) ---");
  print("Q7 SQL: SELECT category, SUM(amount) FROM expenses WHERE group_id = ? GROUP BY category ORDER BY SUM(amount) DESC;");
  print("Q7 Mongo: $match groupId + $group by category + $sort.");
  print("Q9 SQL: SELECT e.*, u.name FROM expenses e JOIN users u ON e.paid_by = u.id WHERE ...;");
  print("Q9 Mongo: $lookup from users on paidBy.");
  print("Q6 SQL: Full-text differs by engine (e.g. tsvector); Mongo uses $text + text index.");
})();
