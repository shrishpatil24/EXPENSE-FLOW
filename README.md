# ExpenseFlow | Production Fintech Ledger

ExpenseFlow is a professional-grade group expense management system built with Next.js 15, MongoDB, and Tailwind CSS. It features a robust credit scoring engine, ACID-compliant transaction handling, and field-level audit trails to ensure financial integrity.

![Dashboard Preview](https://github.com/shrishpatil24/EXPENSE-FLOW/raw/main/public/preview.png) *(Note: Use your actual preview image path here)*

## 🚀 Advanced Features

### 1. 🛡️ Financial Integrity & ACID Transactions
Unlike simple ledger apps, ExpenseFlow uses an **Optimistic Locking** mechanism (versioning) to prevent data races during settlements. All settlements are processed through a central `TransactionManager` that ensures atomic updates across balances and credit histories.

### 2. 📈 User Credit Scoring (proprietary engine)
Our custom **Credit Engine** dynamically calculates user performance based on:
- **Settlement Timeliness**: Paying off debts early boosts your score (+5 to +20).
- **Overdue Penalties**: Debt aging beyond thresholds triggers passive score decay (-5 to -50).
- **Rating Tiers**: 
  - `Excellent ≥ 900`
  - `Good ≥ 750`
  - `Average ≥ 600`
  - `Poor < 600`

### 3. 📝 Field-Level Audit Trail
Transparency is built-in. Every time an expense is edited, ExpenseFlow records a field-level audit log:
- Who initiated the change.
- Exactly what changed (Before & After states).
- Timestamped history available to all group members.

### 4. 📊 Rich Group Analytics
Gain insights into spend behavior with:
- **Category Distribution**: Breakdown of general, food, travel, and utility spending.
- **Participation Metrics**: Visualizes who is contributing most to the group economy.
- **Spending Trends**: Real-time charts powered by `framer-motion` and `recharts`.

### 5. 🔔 Notification & Real-time Sync
- **Server-Sent Events (SSE)**: Group pages sync instantly when others update the ledger.
- **Global Notification Engine**: Users receive alerts for new debts, group invitations, and successful settlements.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT with HTTP-only cookies and Password Reset flows
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Events**: Custom In-memory EventEmitter Bus

---

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shrishpatil24/EXPENSE-FLOW.git
   cd EXPENSE-FLOW
   ```

2. **Environment Configuration**
   Create a `.env.local` file with the following:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📖 Deployment

This application is ready for deployment on [Vercel](https://vercel.com). Ensure you configure the Environment Variables in the Vercel dashboard.

```bash
npx vercel
```

---

## 📜 Course Context
*Part of the academic curriculum for the internship portal development. Reconciled for production-level stability.*

- **Rubric Write-up**: [docs/rubric-report.md](docs/rubric-report.md)
- **Database Scripts**: [scripts/expense-flow-queries.mjs](scripts/expense-flow-queries.mjs)
