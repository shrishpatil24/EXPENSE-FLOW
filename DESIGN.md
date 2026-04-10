# ExpenseFlow: Design Specification

## 1. Project Overview
**ExpenseFlow** is a premium, full-stack expense management application designed to simplify shared finances among groups of users. It focuses on high-integrity transaction management, advanced splitting logic, and a "WOW" visual experience.

### Purpose
To demonstrate a master-level full-stack implementation involving complex calculations (debt simplification), transactional database integrity (MongoDB), and high-end frontend engineering.

---

## 2. Understanding Summary
*   **Target Users**: Small groups (friends, roommates, travelers).
*   **Key Value Proposition**: "One-click" debt simplification and hybrid member management (Ghost users).
*   **Scale**: Optimized for high-performance demo use (Portfolio/Prototype).
*   **Success Criteria**: Zero-jank UI, perfectly accurate mathematical splits, and efficient debt settlement.

---

## 3. Assumptions & Constraints
*   **Tech Stack**: Next.js 15 (App Router), Node.js, MongoDB Atlas, Tailwind CSS.
*   **Currency**: Single-currency support ($) for the initial version.
*   **Financial Integrity**: All financial mutations must use MongoDB Sessions/Transactions.
*   **Authentication**: JWT-based secure auth for primary users.

---

## 4. Architecture & Design

### Backend (Architecture & DBMS)
*   **Pattern**: Next.js API Routes + Server Actions. 
*   **Database**: MongoDB (NoSQL) using Mongoose for schema modeling.
*   **Transactions**: Required for:
    *   Expense Creation (mutates Expense, UserBalances, and GroupTotals).
    *   Settlements (mutates Settlement records and balances).
*   **Cascade Management**: Deleting a group triggers a distributed cleanup of all nested metadata.

### Logic (Simplification Engine)
The system uses a **Greedy Matching Algorithm** to minimize the number of payments required to settle a group:
1.  Compute net balance for every member.
2.  Split members into Debtors (`balance < 0`) and Creditors (`balance > 0`).
3.  Match the largest Debtor with the largest Creditor.
4.  Generate a "Simplification Path" suggestion.

### Frontend (UI/UX)
*   **Design System**: "Glass-Precision" (Dark mode, glassmorphism, translucency).
*   **Interactivity**: 
    *   Framer Motion for layout-level animations.
    *   Optimistic UI updates for adding/editing expenses.
*   **Split Types**: 
    *   Equally, Percentage (%), Manual/Exact, Shares.

---

## 5. Decision Log
| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Framework | Next.js 15 | Unified frontend/backend, high performance, industry standard. |
| Database | MongoDB Atlas | Mentioned "majority MongoDB", handles JSON-like financial splits naturally. |
| Onboarding | Ghost Members | Zero-friction group creation; add people by name without waiting for registration. |
| Logic | Greedy Minimization | Provides the most efficient settlement path for users. |
| Styling | Tailwind + Framer | Speed of development + high-end interactive feel. |

---

## 6. Security & Performance
*   **Security**: CSRF protection, input sanitization, JWT expiration.
*   **Performance**: MongoDB indexing on `groupId` and `userId`; server-side caching for group lists.
