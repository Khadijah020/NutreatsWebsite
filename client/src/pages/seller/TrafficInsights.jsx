import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ShoppingBag, 
  MousePointerClick,
  Smartphone,
  Monitor,
  Globe,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Loader,
  CheckCircle
} from 'lucide-react';

const TrafficInsights = () => {
  console.log('🔵 [COMPONENT] TrafficInsights component mounted');
  
  const { axios } = useAppContext();
  console.log('🔵 [CONTEXT] axios from context:', axios);
  console.log('🔵 [CONTEXT] axios type:', typeof axios);
  
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    traffic: null,
    ecommerce: null,
    devices: null,
    sources: null,
    funnel: null,
    topProducts: null
  });
  
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  console.log('🔵 [ENV] GA_MEASUREMENT_ID:', GA_MEASUREMENT_ID);
  console.log('🔵 [STATE] Initial analyticsData state:', analyticsData);
  console.log('🔵 [STATE] Initial timeRange:', timeRange);
  console.log('🔵 [STATE] Initial loading:', loading);

  useEffect(() => {
    console.log('🟢 [USEEFFECT] useEffect triggered - timeRange changed to:', timeRange);
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    console.log('🟡 [FETCH] fetchAnalyticsData started');
    console.log('🟡 [FETCH] Current timeRange:', timeRange);
    
    setLoading(true);
    console.log('🟡 [FETCH] Loading set to true');
    
    try {
      console.log('🟡 [FETCH] About to make API calls...');
      console.log('🟡 [FETCH] axios instance:', axios);
      
      // Test if axios is working
      if (!axios) {
        console.error('❌ [ERROR] axios is undefined or null!');
        throw new Error('axios instance is not available');
      }
      
      console.log('🟡 [FETCH] Making parallel API requests...');
      
      const requests = [
        { name: 'traffic-overview', url: `/api/analytics/traffic-overview?timeRange=${timeRange}` },
        { name: 'ecommerce-events', url: `/api/analytics/ecommerce-events?timeRange=${timeRange}` },
        { name: 'device-breakdown', url: `/api/analytics/device-breakdown?timeRange=${timeRange}` },
        { name: 'traffic-sources', url: `/api/analytics/traffic-sources?timeRange=${timeRange}` },
        { name: 'conversion-funnel', url: `/api/analytics/conversion-funnel?timeRange=${timeRange}` },
        { name: 'top-products', url: `/api/analytics/top-products?timeRange=${timeRange}` }
      ];
      
      console.log('🟡 [FETCH] API endpoints to call:', requests);
      
      const [traffic, ecommerce, devices, sources, funnel, topProducts] = await Promise.all(
        requests.map(async (req, index) => {
          console.log(`🔹 [API ${index + 1}] Starting request for ${req.name}:`, req.url);
          try {
            const result = await axios.get(req.url);
            console.log(`✅ [API ${index + 1}] Success for ${req.name}:`, result.data);
            return result;
          } catch (error) {
            console.error(`❌ [API ${index + 1}] Failed for ${req.name}:`, error);
            console.error(`❌ [API ${index + 1}] Error response:`, error.response?.data);
            console.error(`❌ [API ${index + 1}] Error status:`, error.response?.status);
            console.error(`❌ [API ${index + 1}] Error message:`, error.message);
            throw error;
          }
        })
      );

      console.log('✅ [FETCH] All API calls completed successfully');
      console.log('📈 [DATA] Traffic data:', traffic.data);
      console.log('🛒 [DATA] Ecommerce data:', ecommerce.data);
      console.log('📱 [DATA] Devices data:', devices.data);
      console.log('🌐 [DATA] Sources data:', sources.data);
      console.log('📊 [DATA] Funnel data:', funnel.data);
      console.log('🏆 [DATA] Top Products data:', topProducts.data);

      const newAnalyticsData = {
        traffic: traffic.data.data,
        ecommerce: ecommerce.data.data,
        devices: devices.data.data,
        sources: sources.data.data,
        funnel: funnel.data.data,
        topProducts: topProducts.data.data
      };
      
      console.log('✅ [STATE] Setting new analyticsData:', newAnalyticsData);
      setAnalyticsData(newAnalyticsData);
      console.log('✅ [STATE] analyticsData has been updated');
      
    } catch (error) {
      console.error('❌ [ERROR] Failed to fetch analytics:', error);
      console.error('❌ [ERROR] Error name:', error.name);
      console.error('❌ [ERROR] Error message:', error.message);
      console.error('❌ [ERROR] Error stack:', error.stack);
      console.error('❌ [ERROR] Error response:', error.response?.data);
      console.error('❌ [ERROR] Error status:', error.response?.status);
      console.error('❌ [ERROR] Full error object:', JSON.stringify(error, null, 2));
    } finally {
      console.log('🟡 [FETCH] Setting loading to false');
      setLoading(false);
      console.log('✅ [FETCH] fetchAnalyticsData completed');
    }
  };

  console.log('🔵 [RENDER] Component rendering with:');
  console.log('🔵 [RENDER] - loading:', loading);
  console.log('🔵 [RENDER] - timeRange:', timeRange);
  console.log('🔵 [RENDER] - analyticsData:', analyticsData);

  // Quick metrics cards - now with real data
  const trafficCards = [
    {
      title: 'Website Visitors',
      value: analyticsData.traffic?.totalUsers || '0',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Total unique visitors'
    },
    {
      title: 'Page Views',
      value: analyticsData.traffic?.pageViews || '0',
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Total pages viewed'
    },
    {
      title: 'Products Viewed',
      value: analyticsData.ecommerce?.productViews || '0',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      description: 'Products detail views'
    },
    {
      title: 'Add to Cart',
      value: analyticsData.ecommerce?.addToCart || '0',
      icon: MousePointerClick,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Items added to cart'
    },
  ];

  console.log('🔵 [RENDER] trafficCards:', trafficCards);

  const deviceData = [
    { name: 'Mobile', value: `${analyticsData.devices?.mobile || 0}%`, icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-600', percentage: parseFloat(analyticsData.devices?.mobile) || 0 },
    { name: 'Desktop', value: `${analyticsData.devices?.desktop || 0}%`, icon: Monitor, color: 'text-purple-600', bgColor: 'bg-purple-600', percentage: parseFloat(analyticsData.devices?.desktop) || 0 },
    { name: 'Tablet', value: `${analyticsData.devices?.tablet || 0}%`, icon: Monitor, color: 'text-emerald-600', bgColor: 'bg-emerald-600', percentage: parseFloat(analyticsData.devices?.tablet) || 0 },
  ];

  console.log('🔵 [RENDER] deviceData:', deviceData);

  const topSources = analyticsData.sources || [
    { source: 'Loading...', visits: '0', color: 'bg-gray-500' }
  ];

  console.log('🔵 [RENDER] topSources:', topSources);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      {console.log('🔵 [JSX] Rendering JSX')}
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Activity className="text-[#EB8A14]" size={28} />
              Traffic & Insights
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Monitor your website's performance, understand visitor behavior, and track how customers interact with your products.
            </p>
          </div>

          {/* Time Range Selector - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200 overflow-x-auto">
              {['Today', '7 Days', '30 Days', '90 Days'].map((range, idx) => {
                const value = ['today', '7days', '30days', '90days'][idx];
                return (
                  <button
                    key={value}
                    onClick={() => {
                      console.log('🟢 [CLICK] Time range button clicked:', value);
                      setTimeRange(value);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      timeRange === value
                        ? 'bg-[#EB8A14] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                console.log('🟢 [CLICK] Refresh button clicked');
                fetchAnalyticsData();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={16} /> : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Google Analytics Status */}
      {GA_MEASUREMENT_ID ? (
        <div className="mb-4 sm:mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-3 sm:p-4 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Activity className="text-emerald-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-emerald-900 mb-1">Google Analytics Active</h3>
              <a
                href="https://analytics.google.com/analytics/web/#/a377867363p516673239/realtime/overview?params=_u..nav%3Dmaui"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <ExternalLink size={14} />
                View in Google Analytics
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 sm:mb-6 bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-4 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Activity className="text-amber-600" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-amber-900 mb-1">Google Analytics Not Configured</h3>
              <p className="text-xs sm:text-sm text-amber-700">
                Add VITE_GA_MEASUREMENT_ID to your .env file to enable analytics tracking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Debug Info */}
      <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🐛 Debug Info</h3>
        <div className="text-xs text-blue-800 space-y-1 font-mono">
          <p>Loading: {String(loading)}</p>
          <p>TimeRange: {timeRange}</p>
          <p>Traffic Data: {JSON.stringify(analyticsData.traffic)}</p>
          <p>Ecommerce Data: {JSON.stringify(analyticsData.ecommerce)}</p>
          <p>Devices Data: {JSON.stringify(analyticsData.devices)}</p>
          <p>Check browser console for detailed logs</p>
        </div>
      </div>

      {/* Traffic Overview Cards */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Key Performance Metrics</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          These metrics show your website's overall performance. Track how many people visit your site, which products they view, and how many add items to their cart.
        </p>
      </div>
      
      {/* 2x2 Grid on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {trafficCards.map((card, index) => {
          console.log(`🔵 [CARD ${index}] Rendering card:`, card.title, 'Value:', card.value);
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`${card.bgColor} p-2 sm:p-3 rounded-lg`}>
                  <card.icon className={card.textColor} size={20} />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 sm:mb-2 uppercase tracking-wide">{card.title}</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                {loading ? <Loader className="animate-spin" size={20} /> : card.value.toLocaleString()}
              </h3>
              <p className="text-[10px] sm:text-sm text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Smartphone className="text-[#EB8A14]" size={18} />
              Device Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              See which devices your customers use to browse your store. If most visitors use mobile, ensure your site looks great on phones!
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <device.icon className={device.color} size={18} />
                  <span className="font-medium text-sm sm:text-base text-gray-700 truncate">{device.name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="h-2 w-20 sm:w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${device.bgColor} rounded-full transition-all duration-500`} 
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 w-10 sm:w-12 text-right">{device.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <TrendingUp className="text-[#EB8A14]" size={18} />
            Conversion Funnel
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Track your customer journey from viewing products to completing purchases. This shows where customers drop off, helping you identify areas to improve your checkout process and increase sales.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {(analyticsData.funnel || [
            { step: 'Product Views', count: 0, percentage: '0%' },
            { step: 'Add to Cart', count: 0, percentage: '0%' },
            { step: 'Begin Checkout', count: 0, percentage: '0%' },
            { step: 'Completed Purchase', count: 0, percentage: '0%' },
          ]).map((stage, index) => {
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500'];
            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-medium text-sm sm:text-base text-gray-700">{stage.step}</span>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-xs sm:text-sm text-gray-500">{stage.count} users</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 w-10 sm:w-12 text-right">{stage.percentage}</span>
                  </div>
                </div>
                <div className="h-6 sm:h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${colors[index]} rounded-lg transition-all duration-500 flex items-center px-2 sm:px-3`}
                    style={{ width: stage.percentage }}
                  >
                    <span className="text-[10px] sm:text-xs font-medium text-white">{stage.percentage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <TrendingUp className="text-[#EB8A14]" size={18} />
            Top Performing Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            See which products are getting the most attention from your customers. These are your best performers based on views, cart additions, and purchases.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin text-[#EB8A14]" size={32} />
          </div>
        ) : analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Views
                      </th>
                      <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Added to Cart
                      </th>
                      <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Purchased
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Conversion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.topProducts.slice(0, 10).map((product, index) => {
                      const medalColors = ['bg-yellow-100 text-yellow-700', 'bg-gray-100 text-gray-700', 'bg-orange-100 text-orange-700'];
                      const medals = ['🥇', '🥈', '🥉'];
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold ${
                              index < 3 ? medalColors[index] : 'bg-gray-50 text-gray-600'
                            }`}>
                              {index < 3 ? medals[index] : index + 1}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs sm:text-sm font-semibold text-blue-600">
                                {product.views}
                              </span>
                              <Eye className="text-blue-400 mt-1" size={14} />
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs sm:text-sm font-semibold text-purple-600">
                                {product.addedToCart}
                              </span>
                              <ShoppingBag className="text-purple-400 mt-1" size={14} />
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                                {product.purchased}
                              </span>
                              <CheckCircle className="text-emerald-400 mt-1" size={14} />
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold ${
                              parseFloat(product.conversionRate) >= 5 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : parseFloat(product.conversionRate) >= 2
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.conversionRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <ShoppingBag className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-sm sm:text-base text-gray-600">No product data available yet</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Product performance will appear here once customers start interacting with your products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficInsights;