import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/user.js";
import Address from "../models/Address.js";

// Place Order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!items || items.length === 0)
      return res.json({ success: false, message: "Cart is empty" });

    // Calculate total and validate items
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.json({ success: false, message: "Product not found" });

      // Determine the price and weight based on what was sent
      let itemPrice;
      let weightData = null;
      
      if (item.weight && product.weights && product.weights.length > 0) {
        // Find the weight in product's weights array
        const weightOption = product.weights.find(w => {
          return w.weight === item.weight;
        });
        
        if (weightOption) {
          itemPrice = weightOption.offerPrice || weightOption.price;
          weightData = weightOption.weight; // Store the weight label
        } else {
          itemPrice = product.offerPrice;
        }
      } else {
        // No weight, use product's offer price
        itemPrice = product.offerPrice;
      }

      total += itemPrice * item.quantity;

      // Store the validated item with complete weight information
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        weight: weightData // Store weight label or null
      });
    }

    let finalUserId = userId;
    let addressId;

    if (!userId) {
  let existingUser = null;

  // Check by email first (if provided)
  if (address.email) {
    existingUser = await User.findOne({ email: address.email });
  }

  //  If not found, check by phone (if provided)
  if (!existingUser && address.phone) {
    existingUser = await User.findOne({ phone: address.phone });
  }

  // If still not found, create a new guest user
  if (!existingUser) {
    existingUser = await User.create({
      name: `${address.firstName} ${address.lastName}`,
      email: address.email || `${address.phone}@guest.local`, // fallback
      phone: address.phone || null,
      isGuest: true,
    });
  }

  finalUserId = existingUser._id;


      // Save guest's address as a proper Address document
      const newAddress = await Address.create({
        userId: finalUserId,
        firstName: address.firstName,
        lastName: address.lastName,
        email: address.email,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        phone: address.phone,
      });

      addressId = newAddress._id;
    } else {
      addressId = address; // logged-in user (ObjectId)
    }

    // ✅ Create the order with validated items
    const newOrder = await Order.create({
      userId: finalUserId,
      items: validatedItems, // Use validated items with weight data
      amount: total,
      address: addressId,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed!",
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.json({ success: false, message: err.message });
  }
};

// Create Bill (Manual Order with Customer Record): /api/order/createBill
export const createBill = async (req, res) => {
  try {
    const { items, amount, address, paymentType, isPaid } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.json({ success: false, message: 'No items provided' });
    }

    if (!address || !address.firstName || !address.phone) {
      return res.json({ success: false, message: 'Customer name and phone are required' });
    }

    // Step 1: Check if customer already exists by phone number
    let existingAddress = await Address.findOne({ phone: address.phone });
    let customerAddressId = null;

    if (existingAddress) {
      // Update existing address with any new information
      existingAddress.firstName = address.firstName || existingAddress.firstName;
      existingAddress.lastName = address.lastName || existingAddress.lastName;
      existingAddress.email = address.email || existingAddress.email;
      existingAddress.street = address.street || existingAddress.street;
      existingAddress.city = address.city || existingAddress.city;
      existingAddress.state = address.state || existingAddress.state;
      existingAddress.zipcode = address.zipcode || existingAddress.zipcode;
      existingAddress.country = address.country || existingAddress.country;
      
      await existingAddress.save();
      customerAddressId = existingAddress._id;
    } else {
      // Create new address record for this customer
      const newAddress = await Address.create({
        userId: null, // No user account for manual billing customers
        firstName: address.firstName,
        lastName: address.lastName || '',
        email: address.email || '',
        phone: address.phone,
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: Number(address.zipcode) || 0,
        country: address.country || 'Pakistan'
      });
      customerAddressId = newAddress._id;
    }

    // Step 2: Validate products and calculate total
    let calculatedAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.json({ 
          success: false, 
          message: `Product not found: ${item.product}` 
        });
      }

      let itemPrice;
      
      // Check if it's a variant (has weight)
      if (item.weight) {
        const variant = product.weights?.find(w => w.weight === item.weight);
        if (!variant) {
          return res.json({ 
            success: false, 
            message: `Variant ${item.weight} not found for ${product.name}` 
          });
        }
        itemPrice = variant.offerPrice || variant.price;
      } else {
        itemPrice = product.offerPrice || product.price;
      }

      calculatedAmount += itemPrice * item.quantity;
      
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        weight: item.weight || null
      });
    }

    // Step 3: Create the order
    const order = await Order.create({
      userId: null, // Manual bills don't have userId
      items: validatedItems,
      amount: calculatedAmount,
      address: customerAddressId, // Link to address
      guestAddress: address, // Store guest address data
      status: 'Order Placed',
      paymentType: paymentType || 'Cash on Delivery',
      isPaid: isPaid || false
    });

    // Populate the order with product details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('address');

    res.json({
      success: true,
      message: 'Bill created successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Add this function to your orderController.js (replaces the previous one)

// Toggle Payment Status: /api/order/toggle-payment
export const togglePaymentStatus = async (req, res) => {
  try {
    const { orderId, isPaid } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    order.isPaid = isPaid;
    await order.save();

    const message = isPaid 
      ? 'Order marked as paid successfully' 
      : 'Order marked as unpaid successfully';

    return res.json({ 
      success: true, 
      message,
      order 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Don't forget to export it:
// export { ..., togglePaymentStatus }

// Get Reports Data: /api/seller/reports
export const getSellerReports = async (req, res) => {
  const { type } = req.query;

  try {
    let reports = [];

    if (type === "weekly") {
      reports = [
        { period: "Week 1", orders: 12, products: 40 },
        { period: "Week 2", orders: 20, products: 55 },
      ];
    } else if (type === "monthly") {
      reports = [
        { period: "Jan", orders: 50, products: 120 },
        { period: "Feb", orders: 40, products: 100 },
      ];
    } else if (type === "yearly") {
      reports = [
        { period: "2023", orders: 600, products: 1500 },
        { period: "2024", orders: 750, products: 1800 },
      ];
    }

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.log(" Error fetching reports:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

// Get Order by ID: /api/order/id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(id)
      .populate({
        path: "items.product",
        model: "product"
      })
      .populate("address");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.log("Error fetching order:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders for Seller: /api/order/sellerOrders
export const getSellerOrders = async (req, res) => {
  try {
    // Fetch ALL orders (including manual orders without userId)
    const orders = await Order.find({})
      .populate('items.product')
      .populate('address') // Populate address reference if it exists
      .sort({ createdAt: -1 })

    return res.json({ success: true, orders })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// Create Manual Order (Seller Dashboard): /api/order/manual
export const createManualOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentType, isPaid, status } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: 'No items provided' });
    }

    if (!address.firstName || !address.phone) {
      return res.json({ success: false, message: 'Customer name and phone are required' });
    }

    // Create new order - use guestAddress for manual orders
    const newOrder = new Order({
      userId: null, // Manual orders don't have a user account
      items,
      amount,
      address: null, // No address reference for manual orders
      guestAddress: address, // Store address as embedded object
      paymentType,
      isPaid: isPaid || false,
      status: status || 'Order Placed',
      date: Date.now()
    });

    await newOrder.save();

    return res.json({ 
      success: true, 
      message: 'Manual order created successfully',
      order: newOrder 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Orders by User ID: /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate({
        path: "items.product",
        model: "product"
      })
      .populate("address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders (for seller/admin): /api/order/sellerOrders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};