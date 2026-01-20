import User from "../models/user.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

// Get all customers: /api/customer/all
export const getAllCustomers = async (req, res) => {
  try {
    // Step 1: Get all users with their data
    const users = await User.find({}, "_id name email hasPassword createdAt");
    
    // Step 2: Get all addresses
    const addresses = await Address.find();
    
    // Step 3: Get all orders
    const orders = await Order.find();

    // Create map for final customers - KEY BY EMAIL (primary identifier)
    const customerMap = new Map();

    // Process users first (those with email accounts)
    for (const user of users) {
      if (!user.email) continue;
      
      const key = user.email.toLowerCase();
      
      // Find primary address for this user
      const userAddress = addresses.find(a => a.userId && a.userId.toString() === user._id.toString());
      
      // Count orders for this user (by userId OR by email)
      const customerOrders = orders.filter(order => 
        (order.userId && order.userId.toString() === user._id.toString()) ||
        order.customerEmail?.toLowerCase() === key
      );
      
      customerMap.set(key, {
        _id: userAddress?._id || user._id,
        userId: user._id,
        firstName: userAddress?.firstName || user.name?.split(' ')[0] || '',
        lastName: userAddress?.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        name: user.name || `${userAddress?.firstName || ''} ${userAddress?.lastName || ''}`.trim(),
        email: user.email,
        phone: userAddress?.phone || '',
        street: userAddress?.street || '',
        city: userAddress?.city || '',
        state: userAddress?.state || '',
        zipcode: userAddress?.zipcode?.toString() || '',
        country: userAddress?.country || '',
        orderCount: customerOrders.length,
        isGuest: !user.hasPassword,
        hasPassword: user.hasPassword || false,
        createdAt: user.createdAt || userAddress?._id.getTimestamp()
      });
    }

    // Process orders from customers without user accounts (legacy/manual orders)
    for (const order of orders) {
      if (!order.customerEmail) continue;
      
      const key = order.customerEmail.toLowerCase();
      
      // Skip if already in map (user account exists)
      if (customerMap.has(key)) {
        continue;
      }
      
      // Find address by email
      const customerAddress = addresses.find(a => 
        a.email?.toLowerCase() === key
      );
      
      // Count all orders for this email
      const customerOrders = orders.filter(o => 
        o.customerEmail?.toLowerCase() === key
      );
      
      customerMap.set(key, {
        _id: customerAddress?._id || order._id,
        userId: null,
        firstName: order.customerName?.split(' ')[0] || customerAddress?.firstName || '',
        lastName: order.customerName?.split(' ').slice(1).join(' ') || customerAddress?.lastName || '',
        name: order.customerName || `${customerAddress?.firstName || ''} ${customerAddress?.lastName || ''}`.trim(),
        email: order.customerEmail,
        phone: order.customerPhone || customerAddress?.phone || '',
        street: customerAddress?.street || order.shippingAddress?.street || '',
        city: customerAddress?.city || order.shippingAddress?.city || '',
        state: customerAddress?.state || order.shippingAddress?.state || '',
        zipcode: customerAddress?.zipcode?.toString() || order.shippingAddress?.zipcode?.toString() || '',
        country: customerAddress?.country || order.shippingAddress?.country || '',
        orderCount: customerOrders.length,
        isGuest: true,
        hasPassword: false,
        createdAt: customerAddress?._id.getTimestamp() || order.createdAt
      });
    }

    // Convert map to array and sort by newest first
    const allCustomers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Separate into guest and registered customers
    const guestCustomers = allCustomers.filter(c => c.isGuest);
    const registeredCustomers = allCustomers.filter(c => !c.isGuest);

    res.json({ 
      success: true, 
      customers: allCustomers,
      guestCustomers,
      registeredCustomers,
      stats: {
        total: allCustomers.length,
        guests: guestCustomers.length,
        registered: registeredCustomers.length
      }
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
// Get single customer with orders: /api/customer/:id
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get address (this is the customer record)
    const address = await Address.findById(id);
    
    if (!address) {
      return res.json({
        success: false,
        message: "Customer not found"
      });
    }

    // Get user data if exists
    let userData = null;
    let isGuest = true;
    let hasPassword = false;
    
    if (address.userId) {
      const user = await User.findById(address.userId, "email hasPassword");
      if (user) {
        userData = user;
        hasPassword = user.hasPassword || false;
        isGuest = !hasPassword;
      }
    }

    // Get all orders for this customer
    // Match by address reference OR by phone number in guestAddress
    const orders = await Order.find({
      $or: [
        { address: id },
        { 'guestAddress.phone': address.phone }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('items.product');

    // Transform customer data
    const customerData = {
      _id: address._id,
      userId: address.userId,
      name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
      email: address.email || '',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipcode: address.zipcode?.toString() || '',
      country: address.country || '',
      isGuest: isGuest,
      hasPassword: hasPassword,
      createdAt: address._id.getTimestamp()
    };

    res.json({
      success: true,
      customer: customerData,
      orders
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Update customer details: /api/customer/:id
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, street, city, state, zipcode, country } = req.body;

    // Find address by _id
    const address = await Address.findById(id);

    if (!address) {
      return res.json({
        success: false,
        message: "Customer not found"
      });
    }

    // Update address data
    const addressData = {
      firstName: firstName || address.firstName,
      lastName: lastName || address.lastName,
      email: email || address.email,
      phone: phone || address.phone,
      street: street || address.street,
      city: city || address.city,
      state: state || address.state,
      zipcode: zipcode ? Number(zipcode) : address.zipcode,
      country: country || address.country
    };

    const updatedAddress = await Address.findByIdAndUpdate(
      address._id,
      { $set: addressData },
      { new: true, runValidators: true }
    );

    // If there's a linked user account, update that too
    if (address.userId) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      await User.findByIdAndUpdate(
        address.userId,
        { 
          $set: { 
            name: fullName || undefined,
            email: email || undefined
          }
        },
        { runValidators: true }
      );
    }

    // Transform response
    const customerData = {
      _id: updatedAddress._id,
      name: `${updatedAddress.firstName || ''} ${updatedAddress.lastName || ''}`.trim(),
      email: updatedAddress.email,
      firstName: updatedAddress.firstName || '',
      lastName: updatedAddress.lastName || '',
      phone: updatedAddress.phone || '',
      street: updatedAddress.street || '',
      city: updatedAddress.city || '',
      state: updatedAddress.state || '',
      zipcode: updatedAddress.zipcode?.toString() || '',
      country: updatedAddress.country || '',
      createdAt: updatedAddress._id.getTimestamp()
    };

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: customerData
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};