import jwt from 'jsonwebtoken'
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/user.js';
import Address from '../models/Address.js';


// Login Seller: /api/seller/login
export const sellerLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
            const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

            res.cookie('sellerToken', token, {
                httpOnly: true,
                secure:  process.env.NODE_ENV === 'production',
                sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7*24*60*60*1000
            })
            return res.json({ success: true, message: "Logged In" })
        } else {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Seller Check Auth :/api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try{
        return res.json({success: true})
    } catch(error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Logout Seller: /api/seller/logout
export const sellerLogout = async(req, res) => {
    try{
        res.clearCookie('sellerToken', {
            httpOnly: true, 
            secure:  process.env.NODE_ENV === 'production', 
            sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',    
        })
        return res.json({success: true, message: 'Logged Out'})
    } catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Get Dispatch Reminders: /api/seller/dispatch-reminders
export const getDispatchReminders = async (req, res) => {
  try {
    const now = new Date();

    // Find all "Packed" orders
    const packedOrders = await Order.find({ status: 'Packed' })
      .populate('items.product')
      .populate('address')
      .sort({ updatedAt: -1 });

    // Categorize orders by urgency
    const reminders = {
      urgent: [], // Over 24 hours
      warning: [], // Between 12-24 hours
      normal: []   // Under 12 hours
    };

    packedOrders.forEach(order => {
      // Get the timestamp when order was marked as "Packed"
      const packedTimestamp = order.statusHistory?.find(
        h => h.status === 'Packed'
      )?.timestamp || order.updatedAt;

      const packedDate = new Date(packedTimestamp);
      const hoursWaiting = (now - packedDate) / (1000 * 60 * 60);

      const orderData = {
        _id: order._id,
        orderId: order._id.toString().slice(-8).toUpperCase(),
        customerName: `${order.address?.firstName || 'N/A'} ${order.address?.lastName || ''}`,
        amount: order.amount,
        packedAt: packedDate,
        hoursWaiting: Math.floor(hoursWaiting),
        itemCount: order.items.length,
        paymentMethod: order.paymentMethod,
      };

      if (hoursWaiting >= 24) {
        reminders.urgent.push(orderData);
      } else if (hoursWaiting >= 12) {
        reminders.warning.push(orderData);
      } else {
        reminders.normal.push(orderData);
      }
    });

    res.json({
      success: true,
      reminders,
      totalPending: packedOrders.length,
      urgentCount: reminders.urgent.length,
      warningCount: reminders.warning.length,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Get Dashboard Analytics: /api/seller/dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Get packed orders for dispatch reminders
    const packedOrders = await Order.find({ status: 'Packed' });
    
    let urgentDispatch = 0;
    let warningDispatch = 0;

    packedOrders.forEach(order => {
      const packedTimestamp = order.statusHistory?.find(
        h => h.status === 'Packed'
      )?.timestamp || order.updatedAt;
      
      const packedDate = new Date(packedTimestamp);
      const hoursWaiting = (now - packedDate) / (1000 * 60 * 60);

      if (hoursWaiting >= 24) {
        urgentDispatch++;
      } else if (hoursWaiting >= 12) {
        warningDispatch++;
      }
    });

    // Calculate date range based on timeRange parameter
    let filterStartDate = new Date();
    let periods = [];
    let previousPeriodStart = new Date();

    switch (timeRange) {
      case '7days':
        filterStartDate.setDate(filterStartDate.getDate() - 7);
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          periods.push({
            label: date.toLocaleDateString('en', { weekday: 'short' }),
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
          });
        }
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
        break;
      case '30days':
        filterStartDate.setDate(filterStartDate.getDate() - 30);
        // Last 30 days (grouped by week)
        for (let i = 3; i >= 0; i--) {
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - (i * 7));
          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekEnd.getDate() - 6);
          periods.push({
            label: `Week ${4 - i}`,
            start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0, 0),
            end: new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59, 999),
          });
        }
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
        break;
      case '6months':
        filterStartDate.setMonth(filterStartDate.getMonth() - 6);
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - i);
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
          periods.push({
            label: monthStart.toLocaleDateString('en', { month: 'short' }),
            start: monthStart,
            end: monthEnd,
          });
        }
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 12);
        break;
      case '1year':
        filterStartDate.setFullYear(filterStartDate.getFullYear() - 1);
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - i);
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
          periods.push({
            label: monthStart.toLocaleDateString('en', { month: 'short' }),
            start: monthStart,
            end: monthEnd,
          });
        }
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 24);
        break;
      default:
        // Default to last 7 days
        filterStartDate.setDate(filterStartDate.getDate() - 7);
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          periods.push({
            label: date.toLocaleDateString('en', { weekday: 'short' }),
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
          });
        }
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
    }

    // Get all orders
    const allOrders = await Order.find().populate('items.product');

    // Filter orders based on selected time range
    const filteredOrders = allOrders.filter(
      o => new Date(o.createdAt) >= filterStartDate
    );

    // === 1. TODAY'S KPIs (These remain for "today" only) ===
    const todayOrders = allOrders.filter(
      o => new Date(o.createdAt) >= todayStart && new Date(o.createdAt) <= todayEnd
    );
    
    const todaySales = todayOrders
      .filter(o => o.status === 'Delivered' || o.status === 'Paid')
      .reduce((sum, order) => sum + order.amount, 0);

    const todayOrdersCount = todayOrders.length;

    // === 2. ORDER STATUS COUNTS (Now based on selected time range) ===
    const newOrders = filteredOrders.filter(o => o.status === 'Order Placed').length;
    
    const packedProcessing = filteredOrders.filter(o => 
      ['Packed'].includes(o.status)
    ).length;

    const unpaidOrders = filteredOrders.filter(o => 
      o.status === 'Delivered' && o.isPaid === false
    ).length;

    const canceledReturned = filteredOrders.filter(o => 
      ['Cancelled', 'Returned'].includes(o.status)
    ).length;

    // === 3. FINANCIAL SUMMARY (Uses ALL orders, not filtered) ===
    // Receivable: Orders in progress (not delivered yet) that are unpaid
    const receivable = allOrders
      .filter(o => 
        !['Delivered', 'Paid', 'Cancelled', 'Returned'].includes(o.status) &&
        o.isPaid === false
      )
      .reduce((sum, order) => sum + order.amount, 0);

    // Payable: COD orders delivered but not paid yet
    const payable = allOrders
      .filter(o => 
        o.status === 'Delivered' && 
        (o.paymentType === 'COD' || o.paymentType === 'Cash on Delivery') && 
        o.isPaid === false
      )
      .reduce((sum, order) => sum + order.amount, 0);

    // Net Payout: Receivable - Payable
    const netPayout = receivable - payable;

    // === 4. SALES DATA FOR GRAPH ===
    const salesData = periods.map(period => {
      const periodOrders = allOrders.filter(
        o => new Date(o.createdAt) >= period.start && new Date(o.createdAt) <= period.end
      );
      const periodRevenue = periodOrders
        .filter(o => o.status === 'Delivered' || o.status === 'Paid')
        .reduce((sum, order) => sum + order.amount, 0);
      
      return {
        period: period.label,
        revenue: periodRevenue,
        orders: periodOrders.length,
      };
    });

    // Calculate growth rate
    const currentPeriodRevenue = filteredOrders
      .filter(o => 
        (o.status === 'Delivered' || o.status === 'Paid')
      )
      .reduce((sum, order) => sum + order.amount, 0);

    const previousPeriodOrders = allOrders.filter(
      o => 
        (o.status === 'Delivered' || o.status === 'Paid') &&
        new Date(o.createdAt) >= previousPeriodStart && 
        new Date(o.createdAt) < filterStartDate
    );
    const previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.amount, 0);

    const growthRate = previousPeriodRevenue > 0 
      ? (((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      analytics: {
        // KPIs (Today only)
        todaySales,
        todayOrders: todayOrdersCount,
        
        // Order Status (Based on selected time range)
        newOrders,
        packedProcessing,
        unpaidOrders,
        canceledReturned,
        
        // Financial (Based on selected time range)
        receivable,
        payable,
        netPayout,
        
        // Graph Data
        salesData,
        growthRate: parseFloat(growthRate),

        // Dispatch Reminders
        urgentCount: urgentDispatch,
        warningCount: warningDispatch,
        totalPackedOrders: packedOrders.length,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};