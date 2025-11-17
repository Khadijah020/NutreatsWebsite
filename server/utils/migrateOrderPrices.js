// server/utils/migrateOrderPrices.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: 'server/.env' });
// MongoDB connection
const connectDB = async () => {
  try {
    // Try different possible env variable names
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGO_URI || 
                     process.env.DATABASE_URL ||
                     process.env.MONGODB_URL;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables!');
      console.log('💡 Please check your .env file contains one of:');
      console.log('   - MONGODB_URI');
      console.log('   - MONGO_URI');
      console.log('   - DATABASE_URL');
      console.log('   - MONGODB_URL\n');
      process.exit(1);
    }
    
    console.log(`🔗 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Migration function
async function migrateOldOrders() {
  try {
    console.log('🔍 Searching for orders without price data...\n');
    
    // Find all orders where items don't have price field
    const orders = await Order.find({ 
      'items.price': { $exists: false } 
    });
    
    console.log(`📦 Found ${orders.length} orders to migrate\n`);
    
    if (orders.length === 0) {
      console.log('✅ All orders already have price data! No migration needed.\n');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const order of orders) {
      try {
        console.log(`Processing Order ID: ${order._id}`);
        let orderUpdated = false;
        
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          
          if (product) {
            // Determine price based on weight
            if (item.weight) {
              const variant = product.weights?.find(w => w.weight === item.weight);
              if (variant) {
                item.price = variant.price;
                item.offerPrice = variant.offerPrice || variant.price;
              } else {
                // Weight not found, use base product price
                item.price = product.price;
                item.offerPrice = product.offerPrice || product.price;
              }
            } else {
              // No weight, use base product price
              item.price = product.price;
              item.offerPrice = product.offerPrice || product.price;
            }
            
            // Store product name and image
            item.name = product.name;
            item.image = product.image[0];
            
            orderUpdated = true;
            console.log(`  ✓ Updated item: ${product.name} - ${item.weight || 'No variant'}`);
          } else {
            console.log(`  ⚠️  Product not found: ${item.product}`);
          }
        }
        
        if (orderUpdated) {
          await order.save();
          successCount++;
          console.log(`  ✅ Order saved successfully\n`);
        }
        
      } catch (error) {
        failCount++;
        console.error(`  ❌ Failed to migrate order ${order._id}:`, error.message, '\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MIGRATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully migrated: ${successCount} orders`);
    console.log(`❌ Failed to migrate: ${failCount} orders`);
    console.log(`📦 Total processed: ${orders.length} orders`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration
const runMigration = async () => {
  try {
    console.log('\n🚀 Starting Order Price Migration...\n');
    
    await connectDB();
    await migrateOldOrders();
    
    console.log('🎉 Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed with error:', error);
    process.exit(1);
  }
};

// Execute
runMigration();