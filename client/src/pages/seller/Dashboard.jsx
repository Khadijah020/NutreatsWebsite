import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Truck,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
  Bell,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const { axios, navigate } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('weekly');
  const [analytics, setAnalytics] = useState({
    todaySales: 0,
    todayOrders: 0,
    pendingShipments: 0,
    returnsCancellations: 0,
    newOrders: 0,
    packedProcessing: 0,
    unpaidOrders: 0,
    canceledReturned: 0,
    receivable: 0,
    payable: 0,
    netPayout: 0,
    salesData: [],
    growthRate: 0,
    urgentCount: 0,
    warningCount: 0,
  });
  const [dispatchReminders, setDispatchReminders] = useState({
    urgent: [],
    warning: [],
    normal: [],
    urgentCount: 0,
    warningCount: 0,
  });
  const [showReminders, setShowReminders] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(`/api/seller/dashboard?timeRange=${timeRange}`);
      console.log('📊 Dashboard Data:', data);
      
      if (data.success) {
        console.log('✅ Analytics:', data.analytics);
        console.log('🔔 Urgent Count:', data.analytics.urgentCount);
        console.log('⚠️ Warning Count:', data.analytics.warningCount);
        setAnalytics(data.analytics);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDispatchReminders = async () => {
    try {
      const { data } = await axios.get('/api/seller/dispatch-reminders');
      console.log('🔔 Dispatch Reminders Raw Response:', data);
      
      if (data.success) {
        console.log('📦 Reminders Object:', data.reminders);
        console.log('🚨 Urgent Count from API:', data.urgentCount);
        console.log('⚠️ Warning Count from API:', data.warningCount);
        console.log('📋 Urgent Orders:', data.reminders.urgent);
        console.log('📋 Warning Orders:', data.reminders.warning);
        
        // FIXED: Set the reminders with counts from the root data object
        setDispatchReminders({
          urgent: data.reminders.urgent || [],
          warning: data.reminders.warning || [],
          normal: data.reminders.normal || [],
          urgentCount: data.urgentCount || 0,
          warningCount: data.warningCount || 0,
        });
        
        console.log('✅ State will be set to:', {
          urgentCount: data.urgentCount,
          warningCount: data.warningCount,
          urgentLength: data.reminders.urgent?.length,
          warningLength: data.reminders.warning?.length,
        });
        
        // Auto-show modal if there are urgent reminders
        if (data.urgentCount > 0) {
          console.log('🚨 AUTO-SHOWING MODAL - Urgent count:', data.urgentCount);
          setShowReminders(true);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch dispatch reminders:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 Effect running - timeRange:', timeRange);
    fetchDashboardData();
    fetchDispatchReminders();
    
    // Refresh reminders every 5 minutes
    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh reminders (5 min interval)');
      fetchDispatchReminders();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  // Debug log whenever dispatchReminders state changes
  useEffect(() => {
    console.log('🔄 dispatchReminders State Updated:', dispatchReminders);
  }, [dispatchReminders]);

  const kpiCards = [
    {
      title: 'Total Sales Today',
      value: `Rs. ${analytics.todaySales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'from-emerald-400 to-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      description: 'Revenue earned today',
    },
    {
      title: 'Total Orders Today',
      value: analytics.todayOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'New orders received',
    },
    {
      title: 'Pending Shipments',
      value: analytics.pendingShipments || 0,
      icon: Truck,
      color: 'from-amber-400 to-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      description: 'Orders awaiting dispatch',
    },
    {
      title: 'Returns / Cancellations',
      value: analytics.returnsCancellations || 0,
      icon: XCircle,
      color: 'from-rose-400 to-rose-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      description: 'Issues needing attention',
    },
  ];

  const orderStatusCards = [
    {
      title: 'New Orders',
      count: analytics.newOrders || 0,
      icon: AlertCircle,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      route: '/seller/orders?status=Order Placed',
    },
    {
      title: 'Packed',
      count: analytics.packedProcessing || 0,
      icon: Package,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      route: '/seller/orders?status=Packed',
    },
    {
      title: 'Unpaid Orders',
      count: analytics.unpaidOrders || 0,
      icon: Clock,
      color: 'from-orange-400 to-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      route: '/seller/orders?status=Delivered&paid=false',
    },
    {
      title: 'Canceled / Returned',
      count: analytics.canceledReturned || 0,
      icon: XCircle,
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      route: '/seller/orders?status=Cancelled,Returned',
    },
  ];

  const financialCards = [
    {
      title: 'Total Receivable',
      value: `Rs. ${analytics.receivable?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      tooltip: 'Money owed to you from pending orders',
    },
    {
      title: 'Total Payable',
      value: `Rs. ${analytics.payable?.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      tooltip: 'COD orders delivered but payment not collected',
    },
    {
      title: 'Net Payout',
      value: `Rs. ${analytics.netPayout?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'from-indigo-400 to-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
      tooltip: 'Receivable minus Payable = Your net earnings',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#EB8A14] border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering Dashboard - dispatchReminders:', dispatchReminders);
  console.log('🎨 Banner condition check:', {
    urgentCount: dispatchReminders.urgentCount,
    warningCount: dispatchReminders.warningCount,
    showReminders,
    shouldShowBanner: (dispatchReminders.urgentCount > 0 || dispatchReminders.warningCount > 0) && !showReminders
  });

  return (
    <div className="min-h-screen py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Dispatch Reminders Modal */}
        {showReminders && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold">Dispatch Reminders</h3>
                      <p className="text-sm opacity-90">Orders waiting to be dispatched</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReminders(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                {/* Urgent Orders (>24 hours) */}
                {dispatchReminders.urgent?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-red-600" size={20} />
                      <h4 className="font-bold text-red-600 text-lg">
                        URGENT - Over 24 Hours ({dispatchReminders.urgent.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {dispatchReminders.urgent.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => navigate(`/seller/orders/${order._id}`)}
                          className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                #{order.orderId}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {order.customerName}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-red-600 text-sm sm:text-base">
                                {order.hoursWaiting}h ago
                              </p>
                              <p className="text-xs text-gray-600">
                                Rs. {order.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning Orders (12-24 hours) */}
                {dispatchReminders.warning?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="text-orange-600" size={20} />
                      <h4 className="font-bold text-orange-600 text-lg">
                        Warning - Over 12 Hours ({dispatchReminders.warning.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {dispatchReminders.warning.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => navigate(`/seller/orders/${order._id}`)}
                          className="p-3 sm:p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:shadow-lg transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                #{order.orderId}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {order.customerName}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-orange-600 text-sm sm:text-base">
                                {order.hoursWaiting}h ago
                              </p>
                              <p className="text-xs text-gray-600">
                                Rs. {order.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No reminders */}
                {dispatchReminders.urgent?.length === 0 && dispatchReminders.warning?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-3">
                      <Package className="text-green-600" size={32} />
                    </div>
                    <p className="text-gray-600 font-medium">All caught up! No pending dispatches.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={() => navigate('/seller/orders?status=Packed')}
                  className="w-full py-3 bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white rounded-xl font-bold hover:shadow-lg transition"
                >
                  View All Packed Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Alert Banner */}
        {(dispatchReminders.urgentCount > 0 || dispatchReminders.warningCount > 0) && !showReminders && (
          <div className="mb-4">
            <div
              onClick={() => {
                console.log('🔔 Banner clicked - opening modal');
                setShowReminders(true);
              }}
              className={`${
                dispatchReminders.urgentCount > 0 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : 'bg-gradient-to-r from-orange-400 to-amber-500'
              } rounded-xl p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-lg animate-pulse flex-shrink-0">
                    <Bell size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm sm:text-base truncate">
                      {dispatchReminders.urgentCount > 0
                        ? `${dispatchReminders.urgentCount} order${dispatchReminders.urgentCount > 1 ? 's' : ''} waiting over 24 hours!`
                        : `${dispatchReminders.warningCount} order${dispatchReminders.warningCount > 1 ? 's' : ''} waiting over 12 hours`
                      }
                    </p>
                    <p className="text-xs text-white/90">Click to view details</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-white flex-shrink-0" />
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your business overview</p>
        </div>

        {/* Rest of the dashboard remains the same... */}
        {/* 1. TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${card.bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.color} shadow-md`}>
                    <Icon className="text-white" size={20} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${card.textColor} mb-1`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* 2. ORDER STATUS SECTION */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Order Status</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {orderStatusCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(card.route)}
                  className={`${card.bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 ${card.borderColor} hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all cursor-pointer text-left`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${card.color} shadow-md`}>
                      <Icon className="text-white" size={16} />
                    </div>
                    <p className={`text-xs sm:text-sm font-bold ${card.textColor} leading-tight`}>{card.title}</p>
                  </div>
                  <p className={`text-3xl sm:text-4xl font-bold ${card.textColor}`}>{card.count}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FINANCIAL SUMMARY CARDS */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {financialCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`${card.bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 sm:border-3 ${card.borderColor} shadow-md hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.color} shadow-md`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="group relative">
                      <Info className="text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      <div className="absolute right-0 top-6 sm:top-8 w-40 sm:w-48 bg-gray-800 text-white text-xs rounded-xl p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        {card.tooltip}
                        <div className="absolute -top-2 right-3 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-medium">{card.title}</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph section - keeping original */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-md">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
                  <p className="text-sm text-gray-500">Track your performance</p>
                </div>
              </div>

              <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl w-fit">
                {['weekly', 'monthly', 'yearly'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  analytics.growthRate >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {analytics.growthRate >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                <span>{Math.abs(analytics.growthRate)}%</span>
              </div>
              <span className="text-sm text-gray-600">vs previous period</span>
            </div>

            <SalesChart data={analytics.salesData} timeRange={timeRange} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Sales Chart Component (No Recharts)
const SalesChart = ({ data, timeRange }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No sales data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  const chartHeight = 200;
  const mobileChartHeight = 180;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const height = isMobile ? mobileChartHeight : chartHeight;
  const chartPadding = 30;

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 sm:py-4 text-[10px] sm:text-xs text-gray-500 font-medium">
        <span className="truncate">Rs. {(maxValue / 1000).toFixed(0)}k</span>
        <span className="truncate">Rs. {(maxValue / 2000).toFixed(0)}k</span>
        <span>Rs. 0</span>
      </div>

      {/* Chart Container */}
      <div className="ml-10 sm:ml-16 overflow-x-auto scrollbar-hide">
        <svg
          width="100%"
          height={height}
          className="min-w-full"
          viewBox={`0 0 ${data.length * 60} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid Lines */}
          <line
            x1="0"
            y1={chartPadding}
            x2={data.length * 60}
            y2={chartPadding}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={height / 2}
            x2={data.length * 60}
            y2={height / 2}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={height - chartPadding}
            x2={data.length * 60}
            y2={height - chartPadding}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Line Chart Path */}
          <path
            d={data
              .map((point, index) => {
                const x = index * 60 + 30;
                const y =
                  height -
                  chartPadding -
                  (point.revenue / maxValue) * (height - chartPadding * 2);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EB8A14" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EB8A14" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EB8A14" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={
              data
                .map((point, index) => {
                  const x = index * 60 + 30;
                  const y =
                    height -
                    chartPadding -
                    (point.revenue / maxValue) * (height - chartPadding * 2);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ') +
              ` L ${data.length * 60 - 30} ${height - chartPadding} L 30 ${
                height - chartPadding
              } Z`
            }
            fill="url(#areaGradient)"
          />

          {/* Data Points */}
          {data.map((point, index) => {
            const x = index * 60 + 30;
            const y =
              height -
              chartPadding -
              (point.revenue / maxValue) * (height - chartPadding * 2);

            return (
              <g key={index}>
                <circle cx={x} cy={y} r="4" fill="#EB8A14" stroke="white" strokeWidth="2" />
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#EB8A14"
                  fillOpacity="0"
                  className="active:fill-opacity-20 sm:hover:fill-opacity-20 transition-all cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="ml-10 sm:ml-16 flex gap-1 mt-2 text-[10px] sm:text-xs overflow-x-auto scrollbar-hide">
        {data.map((point, index) => (
          <div key={index} className="text-center flex-shrink-0" style={{ width: '60px' }}>
            <div className="font-bold text-gray-800 truncate px-1">{point.period}</div>
            <div className="text-[#EB8A14] font-semibold truncate px-1">
              {point.revenue > 1000 
                ? `${(point.revenue / 1000).toFixed(1)}k`
                : point.revenue.toLocaleString()
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;