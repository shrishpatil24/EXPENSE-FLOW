# Expense-Flow — CO4 (transactions & recovery) and CO5 (MongoDB design)

This document ties the **shared expense ledger** mini-project to database theory rubrics. Executable query samples live in [`scripts/expense-flow-queries.mjs`](../scripts/expense-flow-queries.mjs).

---

## 1. Transaction schedules (Expense-Flow domain)

We model two concurrent **logical** transactions on the same group `G`:

| Transaction | Intention (high level) |
|-------------|----------------------|
| **T1** | **Record expense** — validate group membership, insert `expenses` document with embedded `splits[]`. |
| **T2** | **Record settlement** — insert `settlements` and matching `ledgeraudits` row inside a **multi-document transaction** (see `POST /api/settlements`). |

Abstract read/write schedule (X = shared conceptual “group ledger state”; in the app, balances are **derived** from expenses + settlements, not a single row):

| Step | T1 | T2 |
|------|----|----|
| 1 | R1(X) — read group / members for validation | |
| 2 | | R2(X) — read context for settlement |
| 3 | W1(X) — insert expense (ledger effect) | |
| 4 | | W2(X) — insert settlement + audit |

Interleaved schedule **S**: `R1(X), R2(X), W1(X), W2(X)`.

### 1.1 Conflict serializability

Conflicts (same data item, at least one write):

- R1(X) vs W2(X): T1 → T2 (T1 before T2).
- R2(X) vs W1(X): T2 → T1 (T2 before T1).

Precedence graph contains a **cycle** (T1 → T2 → T1). Therefore **S is not conflict-serializable**.

A **serial** order would be all of T1 then T2, or T2 then T1; the interleaving above swaps the relative order of conflicting operations in a way that cannot be produced by either serial permutation without reordering conflicting ops.

### 1.2 View serializability

Assume each transaction’s **first read** on X should see the same value as in a serial execution starting from the same initial database state.

- Both R1(X) and R2(X) observe the **same initial snapshot** of derived balances (before either write).
- In any **serial** execution, the transaction that runs **second** would read X **after** the first transaction’s write, so its first read would differ unless the write is a **blind write** (write without prior read of the final value). Here both transactions **read before write**, so the interleaved schedule can match **neither** serial order’s read semantics on X strictly.

In coursework terms: **treat this schedule as not view-serializable** under the usual “each transaction reads what it would read in some serial schedule” definition, because both reads see pre-update state while writes are interleaved. (If you modeled only blind writes on disjoint documents with no conflicting reads, view serializability could differ—here we intentionally share conceptual X for analysis.)

---

## 2. ACID, concurrency control, and recovery (MongoDB + this app)

### Atomicity

- **Single-document** writes (e.g. `Expense.create`) are atomic in MongoDB.
- **Multi-document atomicity** is demonstrated on **settlement recording**: `Settlement` + `LedgerAudit` are inserted in one `session.withTransaction(...)` in [`src/app/api/settlements/route.ts`](../src/app/api/settlements/route.ts). Either **both** commit or **neither** (abort rolls back both).

### Consistency

- **Schema-level:** Mongoose validates required fields and enums on `Expense`, `Settlement`, etc.
- **Application-level:** Split totals must equal bill amount in [`POST /api/expenses`](../src/app/api/expenses/route.ts); [`SettlementEngine`](../src/lib/settlementEngine.ts) preserves zero-sum-style balance logic across members for simplified debts.

### Isolation

- MongoDB multi-document transactions default to **snapshot** isolation for many read patterns within the transaction.
- **Anomaly example (hypothetical):** If two writers updated a **stored** `runningBalance` field without transactions, you could get a **lost update**. This app avoids that by **deriving** balances in read paths instead of mutating a shared balance row.

### Durability

- After `commitTransaction`, MongoDB persists data subject to write concern (default on Atlas is durable across replica set majority). Single-document inserts are journaled similarly at the storage layer.

### Commit, rollback, recovery

- **Commit:** `withTransaction` commits when the callback completes without throw.
- **Rollback:** thrown error or explicit `abortTransaction` aborts; audit + settlement never appear partially.
- **Recovery:** after crash mid-transaction, MongoDB **aborts** unprepared transactions on recovery; the application can retry the HTTP request.

### Deadlock (conceptual)

Two multi-document transactions locking collections/documents in **opposite order** can deadlock; MongoDB **detects** deadlocks and **aborts** one transaction with an error (application should retry). This is rare for the small two-document settlement flow but valid for the rubric narrative.

---

## 3. SSE pub/sub limitation (implementation note)

[`src/lib/groupEventBus.ts`](../src/lib/groupEventBus.ts) keeps subscribers **in memory** in one Node process. It does **not** scale across multiple server instances—acceptable for demos; production would use Redis, change streams, or a message bus.

---

## 4. CO5 — Relational vs document collections

| Relational (normalized) | MongoDB in Expense-Flow |
|-------------------------|-------------------------|
| `users` | `users` collection |
| `groups`, `group_members` | `groups` with `members: ObjectId[]` (embedded references) |
| `expenses`, `expense_splits` | `expenses` with embedded `splits[]` (denormalized for read speed) |
| `settlements` | `settlements` collection |
| (optional audit) | `ledgeraudits` for transactional demo |

**Impedance mismatch:** SQL would `JOIN` expenses to splits; Mongo often **embeds** splits to fetch one expense in one round trip.

---

## 5. SQL vs MongoDB — representative comparisons

| Task | SQL (illustrative) | MongoDB |
|------|--------------------|---------|
| Group’s expenses newest first | `SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC` | `db.expenses.find({ groupId: gid }).sort({ date: -1 })` |
| Spend by category | `SELECT category, SUM(amount) FROM expenses WHERE group_id = ? GROUP BY category` | `$match` + `$group` on `category` |
| Text search on description | `WHERE description ILIKE '%dinner%'` (or full-text extension) | `$text: { $search: 'dinner' }` with text index |
| Member + expense join | `JOIN users ON paid_by = users.id` | `aggregate` with `$lookup` or populate in Mongoose |

See labeled queries **Q1–Q13** in [`scripts/expense-flow-queries.mjs`](../scripts/expense-flow-queries.mjs).
