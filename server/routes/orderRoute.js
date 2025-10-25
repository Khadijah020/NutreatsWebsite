import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import { 
  getAllOrders, 
  getUserOrders, 
  placeOrderCOD,
  getOrderById,
  getSellerReports,
  createManualOrder,
  getSellerOrders,
  createBill,  // ✅ Make sure this is imported
  togglePaymentStatus
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Customer routes
orderRouter.post('/cod', placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);

// Seller routes
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/id', authSeller, getOrderById);
orderRouter.get('/reports', authSeller, getSellerReports);
orderRouter.get('/sellerOrders', authSeller, getSellerOrders);

// ✅ IMPORTANT: Use createBill (not createManualOrder) for the /createBill route
orderRouter.post('/createBill', authSeller, createBill);
orderRouter.post('/manual', authSeller, createManualOrder);
orderRouter.post('/toggle-payment', authSeller, togglePaymentStatus)  // UPDATED ROUTE

export default orderRouter;