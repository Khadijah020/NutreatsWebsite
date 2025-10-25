import User from "../models/user.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

// Get all customers: /api/customer/all
export const getAllCustomers = async (req, res) => {
  try {
    // Step 1: Get all addresses (these are the actual customers)
    const addresses = await Address.find().sort({ _id: -1 });
    
    // Step 2: Get all orders
    const orders = await Order.find();
    
    // Create a map of customer data from addresses
    const customerMap = new Map();
    
    // Process each address
    for (const address of addresses) {
      const customerId = address._id.toString();
      
      if (!customerMap.has(customerId)) {
        // Count orders for this customer (match by address reference OR phone)
        const customerOrders = orders.filter(order => {
          // Check if order's address matches
          if (order.address && order.address.toString() === customerId) return true;
          
          // For manual bills, check if phone matches in guestAddress
          if (order.guestAddress && order.guestAddress.phone === address.phone) return true;
          
          return false;
        });
        
        customerMap.set(customerId, {
          _id: customerId,
          firstName: address.firstName || '',
          lastName: address.lastName || '',
          name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
          email: address.email || '',
          phone: address.phone || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipcode: address.zipcode?.toString() || '',
          country: address.country || '',
          orderCount: customerOrders.length,
          createdAt: address._id.getTimestamp()
        });
      }
    }
    
    // Convert map to array and sort by creation date (newest first)
    const customers = Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      customers
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
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