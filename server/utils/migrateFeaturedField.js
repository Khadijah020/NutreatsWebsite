// server/utils/migrateFeaturedField.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env (same as your working code)
dotenv.config({ path: 'server/.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables!');
      console.log('💡 Please check your server/.env file contains MONGODB_URI');
      process.exit(1);
    }
    
    console.log('Using Mongo URI:', process.env.MONGODB_URI);
    console.log(`🔗 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // 🔍 Debug Info (like your working code)
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map((c) => c.name));
    console.log('');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Migration function
async function migrateFeaturedField() {
  try {
    console.log('🔍 Checking for products without isFeatured field...\n');
    
    // Find all products where isFeatured field doesn't exist
    const productsWithoutField = await Product.find({ 
      isFeatured: { $exists: false } 
    });
    
    console.log(`📦 Found ${productsWithoutField.length} products without isFeatured field`);
    
    if (productsWithoutField.length === 0) {
      console.log('✅ All products already have the isFeatured field!\n');
      
      // Show current featured status
      const totalProducts = await Product.countDocuments();
      const featuredCount = await Product.countDocuments({ isFeatured: true });
      
      console.log('📊 CURRENT STATUS:');
      console.log(`   Total Products: ${totalProducts}`);
      console.log(`   Featured Products: ${featuredCount}`);
      console.log(`   Not Featured: ${totalProducts - featuredCount}\n`);
      
      return;
    }
    
    console.log('🔄 Adding isFeatured field (set to false) to all products...\n');
    
    // Update all products to add isFeatured: false
    const result = await Product.updateMany(
      { isFeatured: { $exists: false } },
      { $set: { isFeatured: false } }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MIGRATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully updated: ${result.modifiedCount} products`);
    console.log(`📋 Total matched: ${result.matchedCount} products`);
    console.log(`🌟 All products now have isFeatured field set to false`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Verify the update
    console.log('🔍 Verifying migration...');
    const remainingWithoutField = await Product.countDocuments({ 
      isFeatured: { $exists: false } 
    });
    
    if (remainingWithoutField === 0) {
      console.log('✅ Verification successful! All products now have isFeatured field.\n');
      
      // Show final status
      const totalProducts = await Product.countDocuments();
      const featuredCount = await Product.countDocuments({ isFeatured: true });
      
      console.log('📊 FINAL STATUS:');
      console.log(`   Total Products: ${totalProducts}`);
      console.log(`   Featured Products: ${featuredCount}`);
      console.log(`   Not Featured: ${totalProducts - featuredCount}\n`);
      
      console.log('💡 TIP: You can now mark products as featured from the seller dashboard!');
    } else {
      console.log(`⚠️  Warning: ${remainingWithoutField} products still don't have the field.\n`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration
const runMigration = async () => {
  try {
    console.log('\n🚀 Starting isFeatured Field Migration...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await connectDB();
    await migrateFeaturedField();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Migration completed successfully!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed with error:', error);
    process.exit(1);
  }
};

// ESM-safe way to detect if this file is run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runMigration();
}

export default runMigration;