import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer } from '../controllers/customerController.js';
import authSeller from '../middlewares/authSeller.js'; // Note: check if it's 'middleware' or 'middlewares' folder

const customerRouter = express.Router();

// All customer routes require seller authentication
customerRouter.get('/all', authSeller, getAllCustomers);
customerRouter.get('/:id', authSeller, getCustomerById);
customerRouter.put('/:id', authSeller, updateCustomer);

export default customerRouter;