import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js'
import { getOrderById } from '../controllers/orderController.js';
import { getSellerReports } from '../controllers/orderController.js';
import { createManualOrder,  getSellerOrders } from '../controllers/orderController.js'


const orderRouter = express.Router()

orderRouter.post('/cod', placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/id', authSeller, getOrderById)  // ✅ Add this line
orderRouter.get('/reports', authSeller, getSellerReports)
orderRouter.get('/sellerOrders', authSeller, getSellerOrders)  // ADD THIS
orderRouter.post('/createBill', authSeller, createManualOrder)


export default orderRouter