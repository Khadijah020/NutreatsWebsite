// convert-address-userids.js
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const addresses = await db.collection('addresses').find({ userId: { $type: "string" } }).toArray();
  console.log(`Converting ${addresses.length} addresses...`);

  const ops = addresses.map(doc => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { userId: new mongoose.Types.ObjectId(doc.userId) } }
    }
  }));

  const result = await db.collection('addresses').bulkWrite(ops);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run();