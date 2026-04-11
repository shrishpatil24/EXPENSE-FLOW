const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const User = require('./src/models/User').default;
  const Group = require('./src/models/Group').default;
  const Expense = require('./src/models/Expense').default;
  
  const shraa = await User.findOne({ email: 'shraa@gmail.com' });
  if (!shraa) {
      console.log('User shraa@gmail.com not found!');
  } else {
      console.log('Found Shraa:', shraa.name, shraa._id, 'isGhost:', shraa.isGhost);
      const groups = await Group.find({ members: shraa._id });
      console.log('Shraa Groups:', groups.map(g => ({ name: g.name, id: g._id })));
      
      for (const g of groups) {
          const exps = await Expense.find({ groupId: g._id });
          console.log(`Expenses in group ${g.name}:`, exps.map(e => ({ desc: e.description, amount: e.amount, splits: e.splits })));
      }
  }
  process.exit(0);
}
check();
