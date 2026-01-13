// Google Analytics Data API Controller
// Fetches real analytics data from Google Analytics 4

import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize the GA4 client
let analyticsDataClient = null;

const initializeGAClient = () => {
  try {
    // Check if credentials are configured
    if (!process.env.GA_PROPERTY_ID) {
      console.warn('⚠️ GA_PROPERTY_ID not configured. Analytics API disabled.');
      return null;
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not configured. Analytics API disabled.');
      return null;
    }

    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    console.log('✅ Google Analytics Data API initialized');
    return analyticsDataClient;
  } catch (error) {
    console.error('❌ Failed to initialize GA client:', error.message);
    return null;
  }
};

// Get traffic overview metrics
export const getTrafficOverview = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured. Add GA_PROPERTY_ID and service account credentials.',
        data: null
      });
    }

    // Convert timeRange to days
    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    // Fetch metrics from GA4
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    const metrics = {
      totalUsers: response.rows?.[0]?.metricValues[0]?.value || 0,
      pageViews: response.rows?.[0]?.metricValues[1]?.value || 0,
      avgSessionDuration: Math.round(response.rows?.[0]?.metricValues[2]?.value || 0),
      bounceRate: parseFloat(response.rows?.[0]?.metricValues[3]?.value || 0).toFixed(1),
    };

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('❌ GA Traffic Overview Error:', error);
    res.json({ success: false, message: error.message, data: null });
  }
};

// Get e-commerce events (product views, add to cart)
export const getEcommerceEvents = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured',
        data: null
      });
    }

    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    // Fetch e-commerce events
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']
          }
        }
      },
    });

    const events = {
      productViews: 0,
      addToCart: 0,
      beginCheckout: 0,
      purchases: 0
    };

    response.rows?.forEach(row => {
      const eventName = row.dimensionValues[0].value;
      const eventCount = parseInt(row.metricValues[0].value);

      if (eventName === 'view_item') events.productViews = eventCount;
      if (eventName === 'add_to_cart') events.addToCart = eventCount;
      if (eventName === 'begin_checkout') events.beginCheckout = eventCount;
      if (eventName === 'purchase') events.purchases = eventCount;
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('❌ GA E-commerce Events Error:', error);
    res.json({ success: false, message: error.message, data: null });
  }
};

// Get device breakdown
export const getDeviceBreakdown = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured',
        data: null
      });
    }

    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'totalUsers' }],
    });

    const devices = {};
    let total = 0;

    response.rows?.forEach(row => {
      const device = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value);
      devices[device.toLowerCase()] = users;
      total += users;
    });

    // Calculate percentages
    const deviceData = {
      mobile: ((devices.mobile || 0) / total * 100).toFixed(1),
      desktop: ((devices.desktop || 0) / total * 100).toFixed(1),
      tablet: ((devices.tablet || 0) / total * 100).toFixed(1),
    };

    res.json({ success: true, data: deviceData });
  } catch (error) {
    console.error('❌ GA Device Breakdown Error:', error);
    res.json({ success: false, message: error.message, data: null });
  }
};

// Get traffic sources
export const getTrafficSources = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured',
        data: null
      });
    }

    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      limit: 5,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    const sources = response.rows?.map(row => ({
      source: row.dimensionValues[0].value,
      visits: parseInt(row.metricValues[0].value)
    })) || [];

    res.json({ success: true, data: sources });
  } catch (error) {
    console.error('❌ GA Traffic Sources Error:', error);
    res.json({ success: false, message: error.message, data: null });
  }
};

// Get conversion funnel data
export const getConversionFunnel = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured',
        data: null
      });
    }

    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']
          }
        }
      },
    });

    const funnel = {
      productViews: 0,
      addToCart: 0,
      beginCheckout: 0,
      purchase: 0
    };

    response.rows?.forEach(row => {
      const eventName = row.dimensionValues[0].value;
      const eventCount = parseInt(row.metricValues[0].value);

      if (eventName === 'view_item') funnel.productViews = eventCount;
      if (eventName === 'add_to_cart') funnel.addToCart = eventCount;
      if (eventName === 'begin_checkout') funnel.beginCheckout = eventCount;
      if (eventName === 'purchase') funnel.purchase = eventCount;
    });

    // Calculate percentages
    const base = funnel.productViews || 1;
    const funnelData = [
      { step: 'Product Views', count: funnel.productViews, percentage: '100%' },
      { step: 'Add to Cart', count: funnel.addToCart, percentage: `${((funnel.addToCart / base) * 100).toFixed(1)}%` },
      { step: 'Begin Checkout', count: funnel.beginCheckout, percentage: `${((funnel.beginCheckout / base) * 100).toFixed(1)}%` },
      { step: 'Completed Purchase', count: funnel.purchase, percentage: `${((funnel.purchase / base) * 100).toFixed(1)}%` },
    ];

    res.json({ success: true, data: funnelData });
  } catch (error) {
    console.error('❌ GA Conversion Funnel Error:', error);
    res.json({ success: false, message: error.message, data: null });
  }
};

// Get top performing products
export const getTopProducts = async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    if (!analyticsDataClient) {
      analyticsDataClient = initializeGAClient();
    }

    if (!analyticsDataClient) {
      return res.json({
        success: false,
        message: 'Google Analytics not configured',
        data: []
      });
    }

    const daysMap = {
      'today': 0,
      '7days': 6,
      '30days': 29,
      '90days': 89
    };
    const daysAgo = daysMap[timeRange] || 6;

    // Fetch most viewed product pages
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'pageTitle' },
        { name: 'pagePath' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/product/'
          }
        }
      },
      limit: 10,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    // Parse product data from pages
    const products = response.rows?.map(row => {
      const pageTitle = row.dimensionValues[0].value;
      const pagePath = row.dimensionValues[1].value;
      const views = parseInt(row.metricValues[0].value) || 0;
      const users = parseInt(row.metricValues[1].value) || 0;
      
      // Extract product name from title (remove "- NuTreats" or similar suffixes)
      let productName = pageTitle.replace(/\s*[-–|]\s*NuTreats.*$/i, '').trim();
      if (!productName || productName === '(not set)') {
        // Fallback: extract from path
        productName = pagePath.split('/product/')[1]?.split('/')[0]?.replace(/-/g, ' ') || 'Unknown Product';
      }

      return {
        name: productName,
        views: views,
        addedToCart: 0, // Will estimate based on views
        purchased: 0,   // Will estimate based on views
        conversionRate: '0.0',
        users: users
      };
    }) || [];

    // If we have purchase data, try to match it
    try {
      const [purchaseData] = await analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: `${daysAgo}daysAgo`,
            endDate: 'today',
          },
        ],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['add_to_cart', 'purchase']
            }
          }
        },
      });

      // Calculate rough estimates (distribute events proportionally to views)
      const totalViews = products.reduce((sum, p) => sum + p.views, 0);
      let totalAddToCart = 0;
      let totalPurchases = 0;

      purchaseData.rows?.forEach(row => {
        const eventName = row.dimensionValues[0].value;
        const count = parseInt(row.metricValues[0].value) || 0;
        
        if (eventName === 'add_to_cart') totalAddToCart = count;
        if (eventName === 'purchase') totalPurchases = count;
      });

      // Distribute proportionally based on views
      products.forEach(product => {
        if (totalViews > 0) {
          const viewRatio = product.views / totalViews;
          product.addedToCart = Math.round(totalAddToCart * viewRatio);
          product.purchased = Math.round(totalPurchases * viewRatio);
          product.conversionRate = product.views > 0 
            ? ((product.purchased / product.views) * 100).toFixed(1)
            : '0.0';
        }
      });
    } catch (estimateError) {
      console.log('⚠️ Could not fetch cart/purchase estimates:', estimateError.message);
    }

    console.log('🏆 Top Products:', products);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ GA Top Products Error:', error);
    console.error('Error details:', error.message);
    res.json({ success: false, message: error.message, data: [] });
  }
};
