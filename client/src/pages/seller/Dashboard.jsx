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
  AlertTriangle,
  Bell,
  X,
  Sparkles,
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
      if (data.success) {
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
      if (data.success) {
        setDispatchReminders({
          urgent: data.reminders.urgent || [],
          warning: data.reminders.warning || [],
          normal: data.reminders.normal || [],
          urgentCount: data.urgentCount || 0,
          warningCount: data.warningCount || 0,
        });
        if (data.urgentCount > 0) {
          setShowReminders(true);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch dispatch reminders:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDispatchReminders();
    const interval = setInterval(() => {
      fetchDispatchReminders();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const kpiCards = [
    {
      title: 'Total Sales Today',
      value: `Rs. ${analytics.todaySales?.toLocaleString() || 0}`,
      icon: DollarSign,
      gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      description: 'Revenue earned today',
      delay: '0ms',
    },
    {
      title: 'Total Orders Today',
      value: analytics.todayOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-400 via-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20',
      description: 'New orders received',
      delay: '100ms',
    },
    {
      title: 'Pending Shipments',
      value: analytics.pendingShipments || 0,
      icon: Truck,
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      shadow: 'shadow-amber-500/20',
      description: 'Orders awaiting dispatch',
      delay: '200ms',
    },
    {
      title: 'Returns / Cancellations',
      value: analytics.returnsCancellations || 0,
      icon: XCircle,
      gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
      shadow: 'shadow-rose-500/20',
      description: 'Issues needing attention',
      delay: '300ms',
    },
  ];

  const orderStatusCards = [
    {
      title: 'New Orders',
      count: analytics.newOrders || 0,
      icon: AlertCircle,
      gradient: 'from-purple-500 to-indigo-600',
      route: '/seller/orders?status=Order Placed',
    },
    {
      title: 'Packed',
      count: analytics.packedProcessing || 0,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-600',
      route: '/seller/orders?status=Packed',
    },
    {
      title: 'Unpaid Orders',
      count: analytics.unpaidOrders || 0,
      icon: Clock,
      gradient: 'from-orange-500 to-amber-600',
      route: '/seller/orders?status=Delivered&paid=false',
    },
    {
      title: 'Canceled / Returned',
      count: analytics.canceledReturned || 0,
      icon: XCircle,
      gradient: 'from-red-500 to-rose-600',
      route: '/seller/orders?status=Cancelled,Returned',
    },
  ];

  const financialCards = [
    {
      title: 'Total Receivable',
      value: `Rs. ${analytics.receivable?.toLocaleString() || 0}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      tooltip: 'Money owed to you from pending orders',
    },
    {
      title: 'Total Payable',
      value: `Rs. ${analytics.payable?.toLocaleString() || 0}`,
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
      tooltip: 'COD orders delivered but payment not collected',
    },
    {
      title: 'Net Payout',
      value: `Rs. ${analytics.netPayout?.toLocaleString() || 0}`,
      icon: DollarSign,
      gradient: 'from-indigo-500 to-purple-600',
      tooltip: 'Receivable minus Payable = Your net earnings',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#EB8A14]/20 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#EB8A14] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 font-bold mt-6 text-lg animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Dispatch Reminders Modal */}
        {showReminders && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="glass-morphism rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up border-2 border-white/20">
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <Bell className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Dispatch Reminders</h2>
                      <p className="text-white/90 text-sm">Orders waiting to be dispatched</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReminders(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {dispatchReminders.urgent?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                      <h3 className="font-bold text-lg">
                        URGENT - Over 24 Hours ({dispatchReminders.urgent.length})
                      </h3>
                    </div>
                    {dispatchReminders.urgent.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl hover:shadow-xl transition-all cursor-pointer active:scale-98"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900">#{order.orderId}</p>
                            <p className="text-gray-600 text-sm">{order.customerName}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-red-600 font-bold">{order.hoursWaiting}h ago</span>
                            <span className="font-bold text-gray-900">Rs. {order.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dispatchReminders.warning?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-5 h-5" />
                      <h3 className="font-bold text-lg">
                        Warning - Over 12 Hours ({dispatchReminders.warning.length})
                      </h3>
                    </div>
                    {dispatchReminders.warning.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl hover:shadow-xl transition-all cursor-pointer active:scale-98"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900">#{order.orderId}</p>
                            <p className="text-gray-600 text-sm">{order.customerName}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-orange-600 font-bold">{order.hoursWaiting}h ago</span>
                            <span className="font-bold text-gray-900">Rs. {order.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dispatchReminders.urgent?.length === 0 && dispatchReminders.warning?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-gray-600 font-bold text-lg">All caught up!</p>
                    <p className="text-gray-500 text-sm">No pending dispatches.</p>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 bg-white/50">
                <button
                  onClick={() => navigate('/seller/orders?status=Packed')}
                  className="w-full py-3.5 bg-gradient-to-r from-[#EB8A14] via-[#f59e0b] to-[#fb923c] text-white rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95"
                >
                  View All Packed Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Alert Banner */}
        {(dispatchReminders.urgentCount > 0 || dispatchReminders.warningCount > 0) && !showReminders && (
          <div
            onClick={() => setShowReminders(true)}
            className={`${
              dispatchReminders.urgentCount > 0
                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500'
                : 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500'
            } rounded-2xl sm:rounded-3xl p-4 sm:p-5 cursor-pointer hover:shadow-2xl transition-all active:scale-[0.98] animate-slide-in-up`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">
                    {dispatchReminders.urgentCount > 0
                      ? `${dispatchReminders.urgentCount} order${dispatchReminders.urgentCount > 1 ? 's' : ''} waiting over 24 hours!`
                      : `${dispatchReminders.warningCount} order${dispatchReminders.warningCount > 1 ? 's' : ''} waiting over 12 hours`}
                  </p>
                  <p className="text-xs sm:text-sm text-white/90">Tap to view details</p>
                </div>
              </div>
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="glass-morphism rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 animate-slide-in-up border-2 border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-[#EB8A14] via-[#f59e0b] to-[#fb923c] p-3 sm:p-4 rounded-2xl shadow-lg">
                <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's your business overview</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards - 2x2 Grid on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 hover:shadow-2xl transition-all duration-500 group cursor-pointer animate-slide-in-up border-2 border-white/20 hover:scale-105"
                style={{ animationDelay: card.delay }}
              >
                <div className={`bg-gradient-to-br ${card.gradient} p-2.5 sm:p-3 lg:p-4 rounded-2xl shadow-lg ${card.shadow} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-7 text-white" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wider">
                  {card.title}
                </h3>
                <p className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* Order Status */}
        <div className="glass-morphism rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 animate-slide-in-up border-2 border-white/20" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 sm:p-3 rounded-xl">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Status</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {orderStatusCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(card.route)}
                  className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-gray-100 hover:border-gray-200 active:scale-95"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                  <div className={`relative bg-gradient-to-br ${card.gradient} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="relative text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="relative text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{card.count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass-morphism rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 animate-slide-in-up border-2 border-white/20" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 sm:p-3 rounded-xl">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Financial Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {financialCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="relative group bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className="relative flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${card.gradient} p-3 sm:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl max-w-[200px]">
                        {card.tooltip}
                      </div>
                    </div>
                  </div>
                  <h3 className="relative text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="relative text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Overview */}
        <div className="glass-morphism rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 animate-slide-in-up border-2 border-white/20" style={{ animationDelay: '600ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-2.5 sm:p-3 rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Overview</h2>
                <p className="text-xs sm:text-sm text-gray-600">Track your performance</p>
              </div>
            </div>

            <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200">
              {['weekly', 'monthly', 'yearly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-[#EB8A14] via-[#f59e0b] to-[#fb923c] text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-sm ${
                analytics.growthRate >= 0
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                  : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
              }`}
            >
              {analytics.growthRate >= 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              {Math.abs(analytics.growthRate || 0).toFixed(1)}%
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">vs previous period</span>
          </div>

          <SalesChart data={analytics.salesData} timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
};

// SUPER SIMPLE RESPONSIVE CHART - NO LIBRARIES
const SalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50"></div>
          <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 sm:w-14 sm:h-14 text-blue-500" />
          </div>
        </div>
        <p className="text-gray-700 font-bold text-lg sm:text-xl mb-2">No sales data yet</p>
        <p className="text-gray-500 text-sm sm:text-base">Sales will appear here once you have orders</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.revenue || 0), 1);

  return (
    <div className="space-y-6">
      {/* Simple Chart - Just Bars and Labels Stacked */}
      <div className="space-y-4">
        {data.map((point, index) => {
          const revenue = point.revenue || 0;
          const widthPercent = (revenue / maxValue) * 100;
          
          return (
            <div key={index} className="space-y-2">
              {/* Label and Value */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">{point.period}</span>
                <span className="text-sm font-bold text-[#EB8A14]">
                  Rs. {revenue >= 1000 ? `${(revenue / 1000).toFixed(1)}k` : revenue.toLocaleString()}
                </span>
              </div>
              
              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-full h-8 sm:h-10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ea580c] via-[#fb923c] to-[#fbbf24] transition-all duration-700 flex items-center justify-end pr-3"
                  style={{ width: `${widthPercent}%`, minWidth: revenue > 0 ? '40px' : '0' }}
                >
                  {revenue > 0 && (
                    <span className="text-white text-xs font-bold drop-shadow-lg">
                      {widthPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t-2 border-gray-100">
        {[
          { 
            label: 'Total Sales', 
            value: data.reduce((sum, d) => sum + (d.revenue || 0), 0),
            gradient: 'from-blue-500 to-cyan-600',
          },
          { 
            label: 'Average', 
            value: Math.round(data.reduce((sum, d) => sum + (d.revenue || 0), 0) / data.length),
            gradient: 'from-purple-500 to-pink-600',
          },
          { 
            label: 'Peak', 
            value: maxValue,
            gradient: 'from-orange-500 to-red-600',
          },
        ].map((stat, index) => (
          <div key={index} className="relative group">
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 sm:p-5 border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
                <p className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Rs. {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;