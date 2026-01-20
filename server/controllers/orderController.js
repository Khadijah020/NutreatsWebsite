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

    // ✅ Calculate total and validate items WITH PRICE STORAGE
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.json({ success: false, message: "Product not found" });

      // ✅ Determine the price and weight based on what was sent
      let itemPrice;
      let itemOfferPrice;
      let weightData = null;
      
      if (item.weight && product.weights && product.weights.length > 0) {
        // Find the weight in product's weights array
        const weightOption = product.weights.find(w => w.weight === item.weight);
        
        if (weightOption) {
          itemPrice = weightOption.price;
          itemOfferPrice = weightOption.offerPrice || weightOption.price;
          weightData = weightOption.weight; // Store the weight label
        } else {
          itemPrice = product.price;
          itemOfferPrice = product.offerPrice || product.price;
        }
      } else {
        // No weight, use product's offer price
        itemPrice = product.price;
        itemOfferPrice = product.offerPrice || product.price;
      }

      total += itemOfferPrice * item.quantity;

      // ✅ Store the validated item with PRICE DATA
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        weight: weightData, // Store weight label or null
        price: itemPrice, // ← STORE ORIGINAL PRICE
        offerPrice: itemOfferPrice, // ← STORE DISCOUNTED PRICE
        name: product.name, // ← STORE NAME
        image: product.image[0] // ← STORE IMAGE
      });
    }

    let finalUserId = userId;
    let addressId;
    let customerName = '';
    let customerEmail = '';
    let customerPhone = '';

    if (!userId) {
      // Guest checkout - look up customer by EMAIL only
      let existingUser = null;

      if (address.email) {
        existingUser = await User.findOne({ email: address.email });
      }

      if (!existingUser && address.email) {
        // Create new guest customer with hasPassword = false
        existingUser = await User.create({
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          hasPassword: false,
          isGuest: true,
        });
      } else if (!existingUser) {
        // No email provided - create with placeholder
        existingUser = await User.create({
          name: `${address.firstName} ${address.lastName}`,
          email: `guest_${Date.now()}@guest.local`,
          hasPassword: false,
          isGuest: true,
        });
      }

      finalUserId = existingUser._id;
      customerName = `${address.firstName} ${address.lastName}`;
      customerEmail = address.email || '';
      customerPhone = address.phone || '';

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
      
      // Get user details for order record
      const user = await User.findById(userId);
      const userAddress = await Address.findById(address);
      
      customerName = user?.name || (userAddress ? `${userAddress.firstName} ${userAddress.lastName}` : '');
      customerEmail = user?.email || userAddress?.email || '';
      customerPhone = userAddress?.phone || '';
    }

    // Get shipping address details
    let shippingAddressData = null;
    if (!userId) {
      // Guest - use provided address
      shippingAddressData = {
        firstName: address.firstName,
        lastName: address.lastName,
        email: address.email,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
      };
    } else {
      // Logged-in user - fetch address
      const userAddress = await Address.findById(addressId);
      if (userAddress) {
        shippingAddressData = {
          firstName: userAddress.firstName,
          lastName: userAddress.lastName,
          email: userAddress.email,
          phone: userAddress.phone,
          street: userAddress.street,
          city: userAddress.city,
          state: userAddress.state,
          zipcode: userAddress.zipcode,
          country: userAddress.country,
        };
      }
    }

    // ✅ Create the order with validated items (including prices)
    const newOrder = await Order.create({
      userId: finalUserId,
      customerName,
      customerEmail,
      customerPhone,
      items: validatedItems, // Now includes price, offerPrice, name, image
      amount: total,
      address: addressId,
      shippingAddress: shippingAddressData,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed",
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

    if (!address || !address.firstName) {
      return res.json({ success: false, message: 'Customer name is required' });
    }

    // Step 1: Look up or create customer by EMAIL (primary identifier)
    let existingUser = null;
    let customerAddressId = null;

    if (address.email) {
      // Look up customer by email
      existingUser = await User.findOne({ email: address.email });
      
      if (!existingUser) {
        // Create new guest customer
        existingUser = await User.create({
          name: `${address.firstName} ${address.lastName || ''}`.trim(),
          email: address.email,
          hasPassword: false,
          isGuest: true,
        });
      }
    } else if (address.phone) {
      // Fallback: check if address exists by phone
      const existingAddress = await Address.findOne({ phone: address.phone });
      if (existingAddress && existingAddress.userId) {
        existingUser = await User.findById(existingAddress.userId);
      }
      
      if (!existingUser) {
        // Create guest with placeholder email
        existingUser = await User.create({
          name: `${address.firstName} ${address.lastName || ''}`.trim(),
          email: `guest_${Date.now()}@guest.local`,
          hasPassword: false,
          isGuest: true,
        });
      }
    }

    // Create or update address
    if (existingUser) {
      // Check if address exists for this user
      let existingAddress = await Address.findOne({ 
        userId: existingUser._id,
        phone: address.phone 
      });

      if (existingAddress) {
        // Update existing address
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
        // Create new address for this customer
        const newAddress = await Address.create({
          userId: existingUser._id,
          firstName: address.firstName,
          lastName: address.lastName || '',
          email: address.email || '',
          phone: address.phone || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipcode: Number(address.zipcode) || 0,
          country: address.country || 'Pakistan'
        });
        customerAddressId = newAddress._id;
      }
    }

    // ✅ Step 2: Validate products and calculate total WITH PRICE STORAGE
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
      let itemOfferPrice;
      
      // Check if it's a variant (has weight)
      if (item.weight) {
        const variant = product.weights?.find(w => w.weight === item.weight);
        if (!variant) {
          return res.json({ 
            success: false, 
            message: `Variant ${item.weight} not found for ${product.name}` 
          });
        }
        itemPrice = variant.price;
        itemOfferPrice = variant.offerPrice || variant.price;
      } else {
        itemPrice = product.price;
        itemOfferPrice = product.offerPrice || product.price;
      }

      calculatedAmount += itemOfferPrice * item.quantity;
      
      // ✅ Store with price data
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        weight: item.weight || null,
        price: itemPrice, // ← STORE ORIGINAL PRICE
        offerPrice: itemOfferPrice, // ← STORE DISCOUNTED PRICE
        name: product.name, // ← STORE NAME
        image: product.image[0] // ← STORE IMAGE
      });
    }

    // Step 3: Create the order
    const order = await Order.create({
      userId: existingUser ? existingUser._id : null,
      customerName: `${address.firstName} ${address.lastName || ''}`.trim(),
      customerEmail: address.email || '',
      customerPhone: address.phone || '',
      items: validatedItems, // Now includes prices
      amount: calculatedAmount,
      address: customerAddressId,
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName || '',
        email: address.email || '',
        phone: address.phone || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: Number(address.zipcode) || 0,
        country: address.country || 'Pakistan'
      },
      guestAddress: address, // Store guest address data for backward compatibility
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

    // ✅ Validate and add prices to items
    const validatedItems = [];
    let calculatedAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.json({ 
          success: false, 
          message: `Product not found: ${item.product}` 
        });
      }

      let itemPrice;
      let itemOfferPrice;
      
      if (item.weight) {
        const variant = product.weights?.find(w => w.weight === item.weight);
        if (variant) {
          itemPrice = variant.price;
          itemOfferPrice = variant.offerPrice || variant.price;
        } else {
          itemPrice = product.price;
          itemOfferPrice = product.offerPrice || product.price;
        }
      } else {
        itemPrice = product.price;
        itemOfferPrice = product.offerPrice || product.price;
      }

      calculatedAmount += itemOfferPrice * item.quantity;
      
      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        weight: item.weight || null,
        price: itemPrice,
        offerPrice: itemOfferPrice,
        name: product.name,
        image: product.image[0]
      });
    }

    // Create new order - use guestAddress for manual orders
    const newOrder = new Order({
      userId: null, // Manual orders don't have a user account
      customerName: `${address.firstName} ${address.lastName || ''}`.trim(),
      customerEmail: address.email || '',
      customerPhone: address.phone || '',
      items: validatedItems, // Now includes prices
      amount: calculatedAmount, // Use calculated amount
      address: null, // No address reference for manual orders
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName || '',
        email: address.email || '',
        phone: address.phone || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: Number(address.zipcode) || 0,
        country: address.country || 'Pakistan'
      },
      guestAddress: address, // Store address as embedded object for backward compatibility
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
    
    // Verify user is authenticated
    if (!userId) {
      return res.json({ 
        success: false, 
        message: 'Authentication required to view order history' 
      });
    }
    
    // Verify user has a password (is registered, not just a guest)
    const user = await User.findById(userId);
    if (!user || !user.hasPassword) {
      return res.json({ 
        success: false, 
        message: 'Please register or login to view your order history' 
      });
    }
    
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

// Update Order Status: /api/order/update-status
// Update Order Status (now includes payment): /api/order/update-status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, note, trackingInfo } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: 'Order ID is required' });
    }

    if (!status) {
      return res.json({ success: false, message: 'Status is required' });
    }

    const validStatuses = [
      'Order Placed',
      'Confirmed',
      'Packed',
      'Dispatched',
      'Delivered',
      'Cancelled',
      'Returned'
    ];

    if (!validStatuses.includes(status)) {
      return res.json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      note: note || ''
    });

    // Update current status
    order.status = status;

    // ✅ Auto-update isPaid based on status
    if (status === 'Paid') {
      order.isPaid = true;
      if (!order.paymentDate) {
        order.paymentDate = new Date();
      }
    }

    // ✅ When delivered, set delivery date
    if (status === 'Delivered') {
      order.deliveryDate = new Date();
    }

    // ✅ When completed (delivered + paid for COD)
    if (status === 'Completed') {
      if (!order.deliveryDate) {
        order.deliveryDate = new Date();
      }
      order.isPaid = true;
      if (!order.paymentDate) {
        order.paymentDate = new Date();
      }
    }

    // Update tracking info if provided
    if (trackingInfo) {
      order.trackingInfo = trackingInfo;
    }

    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(orderId)
      .populate('items.product')
      .populate('address');

    return res.json({ 
      success: true, 
      message: `Order status updated to ${status}`,
      order: populatedOrder
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};