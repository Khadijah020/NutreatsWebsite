import mongoose from 'mongoose';
import User from '../models/user.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateGuestCheckout = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Update all users with hasPassword flag
    console.log('\n📝 Step 1: Updating User model...');
    
    // Set hasPassword=true for users with passwords
    const usersWithPasswords = await User.updateMany(
      { password: { $exists: true, $ne: null, $ne: '' } },
      { $set: { hasPassword: true, isGuest: false } }
    );
    console.log(`✅ Updated ${usersWithPasswords.modifiedCount} users with passwords`);
    
    // Set hasPassword=false for guest users
    const guestUsers = await User.updateMany(
      { $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]},
      { $set: { hasPassword: false, isGuest: true } }
    );
    console.log(`✅ Updated ${guestUsers.modifiedCount} guest users`);

    // Step 2: Migrate order data
    console.log('\n📝 Step 2: Migrating Order data...');
    
    const orders = await Order.find({})
      .populate('userId')
      .populate('address');
    
    let ordersUpdated = 0;
    
    for (const order of orders) {
      const updates = {};
      
      // Add customer name
      if (order.userId && order.userId.name) {
        updates.customerName = order.userId.name;
      } else if (order.address) {
        updates.customerName = `${order.address.firstName} ${order.address.lastName}`.trim();
      } else if (order.guestAddress) {
        updates.customerName = `${order.guestAddress.firstName || ''} ${order.guestAddress.lastName || ''}`.trim();
      }
      
      // Add customer email
      if (order.userId && order.userId.email) {
        updates.customerEmail = order.userId.email;
      } else if (order.address && order.address.email) {
        updates.customerEmail = order.address.email;
      } else if (order.guestAddress && order.guestAddress.email) {
        updates.customerEmail = order.guestAddress.email;
      }
      
      // Add customer phone
      if (order.address && order.address.phone) {
        updates.customerPhone = order.address.phone;
      } else if (order.guestAddress && order.guestAddress.phone) {
        updates.customerPhone = order.guestAddress.phone;
      }
      
      // Add shipping address
      if (order.address) {
        updates.shippingAddress = {
          firstName: order.address.firstName,
          lastName: order.address.lastName,
          email: order.address.email,
          phone: order.address.phone,
          street: order.address.street,
          city: order.address.city,
          state: order.address.state,
          zipcode: order.address.zipcode,
          country: order.address.country,
        };
      } else if (order.guestAddress) {
        updates.shippingAddress = {
          firstName: order.guestAddress.firstName,
          lastName: order.guestAddress.lastName,
          email: order.guestAddress.email,
          phone: order.guestAddress.phone,
          street: order.guestAddress.street,
          city: order.guestAddress.city,
          state: order.guestAddress.state,
          zipcode: order.guestAddress.zipcode,
          country: order.guestAddress.country,
        };
      }
      
      if (Object.keys(updates).length > 0) {
        await Order.findByIdAndUpdate(order._id, { $set: updates });
        ordersUpdated++;
      }
    }
    
    console.log(`✅ Updated ${ordersUpdated} orders with customer and shipping data`);

    // Step 3: Consolidate duplicate guest users by email
    console.log('\n📝 Step 3: Consolidating duplicate guest users...');
    
    const emailGroups = await User.aggregate([
      { 
        $match: { 
          email: { $exists: true, $ne: null },
          hasPassword: false 
        } 
      },
      { 
        $group: { 
          _id: '$email', 
          count: { $sum: 1 },
          users: { $push: { id: '$_id', createdAt: '$createdAt' } }
        } 
      },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    let consolidatedCount = 0;
    
    for (const group of emailGroups) {
      // Sort by creation date, keep oldest
      const sortedUsers = group.users.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      const keepUser = sortedUsers[0].id;
      const duplicateIds = sortedUsers.slice(1).map(u => u.id);
      
      // Update orders and addresses to point to the kept user
      await Order.updateMany(
        { userId: { $in: duplicateIds } },
        { $set: { userId: keepUser } }
      );
      
      await Address.updateMany(
        { userId: { $in: duplicateIds.map(id => id.toString()) } },
        { $set: { userId: keepUser.toString() } }
      );
      
      // Delete duplicate users
      await User.deleteMany({ _id: { $in: duplicateIds } });
      
      consolidatedCount += duplicateIds.length;
    }
    
    console.log(`✅ Consolidated ${consolidatedCount} duplicate guest users`);

    // Step 4: Summary
    console.log('\n📊 Migration Summary:');
    const totalUsers = await User.countDocuments();
    const registeredUsers = await User.countDocuments({ hasPassword: true });
    const guestUsersCount = await User.countDocuments({ hasPassword: false });
    const totalOrders = await Order.countDocuments();
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Registered Users: ${registeredUsers}`);
    console.log(`   Guest Users: ${guestUsersCount}`);
    console.log(`   Total Orders: ${totalOrders}`);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Run migration
migrateGuestCheckout();
