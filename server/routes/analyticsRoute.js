import express from 'express';
import { 
  getTrafficOverview, 
  getEcommerceEvents,
  getDeviceBreakdown,
  getTrafficSources,
  getConversionFunnel,
  getTopProducts
} from '../controllers/analyticsController.js';
import authSeller from '../middlewares/authSeller.js';

const analyticsRoute = express.Router();

// All routes require seller authentication
analyticsRoute.get('/traffic-overview', authSeller, getTrafficOverview);
analyticsRoute.get('/ecommerce-events', authSeller, getEcommerceEvents);
analyticsRoute.get('/device-breakdown', authSeller, getDeviceBreakdown);
analyticsRoute.get('/traffic-sources', authSeller, getTrafficSources);
analyticsRoute.get('/conversion-funnel', authSeller, getConversionFunnel);
analyticsRoute.get('/top-products', authSeller, getTopProducts);

export default analyticsRoute;
