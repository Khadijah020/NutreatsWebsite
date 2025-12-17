import express from 'express'
import { getDashboardAnalytics, getDispatchReminders, isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js'
import authSeller from '../middlewares/authSeller.js'

const sellerRouter = express.Router()
sellerRouter.post('/login', sellerLogin)
sellerRouter.get('/is-auth', authSeller,isSellerAuth)
sellerRouter.get('/logout', sellerLogout)
sellerRouter.get('/dashboard', authSeller,  getDashboardAnalytics);
 sellerRouter.get('/dispatch-reminders', authSeller,  getDispatchReminders);   
export default sellerRouter
