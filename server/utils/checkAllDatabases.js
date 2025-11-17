import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

const checkAllDatabases = async () => {
  try {
    // Connect WITHOUT specifying database
    const baseUri = process.env.MONGODB_URI.split('?')[0].split('/').slice(0, -1).join('/') || process.env.MONGODB_URI;
    await mongoose.connect(baseUri);
    console.log("✅ Connected to MongoDB Cluster");
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    console.log(`\n📊 Found ${databases.length} databases:\n`);
    
    for (const db of databases) {
      console.log(`📁 Database: ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      
      // Connect to this database
      const dbConnection = mongoose.connection.useDb(db.name);
      const collections = await dbConnection.db.listCollections().toArray();
      
      for (const collection of collections) {
        const count = await dbConnection.db.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documents`);
        
        // If it's a products collection with data, show sample
        if (collection.name === 'products' && count > 0) {
          const sample = await dbConnection.db.collection('products').findOne();
          console.log(`     ✨ Sample product: ${sample.name}`);
        }
      }
      console.log('');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkAllDatabases();