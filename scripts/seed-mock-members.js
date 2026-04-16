const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function seedMockMembers() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    // Instead of requiring models which might use ES Modules or Next.js specifics, 
    // we'll just use raw Mongoose schemas
    const groupSchema = new mongoose.Schema({}, { strict: false });
    const userSchema = new mongoose.Schema({}, { strict: false });
    
    const Group = mongoose.model('Group', groupSchema, 'groups');
    const User = mongoose.model('User', userSchema, 'users');

    // Get the first group
    const group = await Group.findOne();
    
    if (!group) {
      console.log('No groups found! Please create a group in the app first.');
      process.exit(0);
    }
    console.log(`Found group: ${group.name} (${group._id})`);

    const mockNames = ['Alex Demo', 'Sarah Tester', 'John Doe', 'Emily Mock', 'David Dev'];
    let addedCount = 0;

    for (const name of mockNames) {
      const email = `${name.toLowerCase().replace(' ', '.')}@mock.local`;
      
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        // Create standard ghost user
        const result = await User.create({
          name,
          email,
          password: 'mock_password_hash', // Unused for ghosts usually but good for schema
          isGhost: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        user = result;
        console.log(`Created mock user: ${name}`);
      } else {
        console.log(`Mock user ${name} already exists.`);
      }

      // Add to group if not already there
      const isMember = group.members && group.members.some(mId => mId.toString() === user._id.toString());
      if (!isMember) {
        await Group.updateOne(
          { _id: group._id },
          {
            $push: {
              members: user._id,
              roles: { userId: user._id, role: "MEMBER" }
            }
          }
        );
        console.log(`Added ${name} to group ${group.name}`);
        addedCount++;
      } else {
        console.log(`${name} is already in the group.`);
      }
    }

    // Now seed some transactions/expenses if none exist in the group
    const expenseSchema = new mongoose.Schema({}, { strict: false });
    const transactionSchema = new mongoose.Schema({}, { strict: false });
    
    // Check if models are already registered to avoid OverwriteModelError
    const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema, 'expenses');
    const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema, 'transactions');
    
    // Get all members of the group
    const groupMembers = group.members || [];
    
    if (groupMembers.length >= 2) {
      const expensesCount = await Expense.countDocuments({ group: group._id });
      if (expensesCount === 0) {
        console.log("No expenses found in group. Seeding mock expenses and transactions...");
        
        // Payer is first member, debtors are rest
        const payer = groupMembers[0];
        const debtors = groupMembers.slice(1);
        
        // Expense 1: Dinner
        let totalAmount = 3000;
        let eachShare = totalAmount / groupMembers.length;
        
        const expense1 = await Expense.create({
          description: "Team Dinner at Mock Restaurant",
          amount: totalAmount,
          currency: "INR",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          category: "FOOD",
          paidBy: payer,
          group: group._id,
          splitMethod: "EQUAL",
          splits: groupMembers.map(memberId => ({
            user: memberId,
            amount: eachShare,
            percentage: 100 / groupMembers.length
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "ACTIVE"
        });
        
        // Create corresponding transactions for Expense 1
        for (const debtor of debtors) {
          await Transaction.create({
            expenseId: expense1._id,
            fromUser: debtor,
            toUser: payer,
            group: group._id,
            amount: eachShare,
            currency: "INR",
            status: "PENDING",
            type: "EXPENSE_SPLIT",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Expense 2: Movie Tickets
        totalAmount = 1500;
        eachShare = totalAmount / groupMembers.length;
        
        const expense2 = await Expense.create({
          description: "Movie Tickets",
          amount: totalAmount,
          currency: "INR",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          category: "ENTERTAINMENT",
          paidBy: debtors[0], // Someone else paid
          group: group._id,
          splitMethod: "EQUAL",
          splits: groupMembers.map(memberId => ({
            user: memberId,
            amount: eachShare,
            percentage: 100 / groupMembers.length
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "ACTIVE"
        });
        
        // Create corresponding transactions for Expense 2
        for (const member of groupMembers) {
          if (member.toString() !== debtors[0].toString()) {
            await Transaction.create({
              expenseId: expense2._id,
              fromUser: member,
              toUser: debtors[0],
              group: group._id,
              amount: eachShare,
              currency: "INR",
              status: "PENDING",
              type: "EXPENSE_SPLIT",
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        console.log("Mock expenses and transactions seeded successfully.");
      } else {
        console.log("Expenses already exist in this group. Skipping transaction seeding.");
      }
    }

    console.log(`\nSuccessfully added ${addedCount} new mock members to your group.`);
    console.log(`Refresh your browser to see the new members in the Split dropdown!`);
    
  } catch (error) {
    console.error("Error seeding mock members:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seedMockMembers();
