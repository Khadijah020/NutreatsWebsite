import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register once at module scope. Chart.js 4 is tree-shakeable, so forgetting
// this is a common cause of a silent crash the first time the chart mounts.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

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

  return (
    <div className="min-h-screen py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">

        {/* Dispatch Reminders Modal */}
        {showReminders && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
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

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
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

                {dispatchReminders.urgent?.length === 0 && dispatchReminders.warning?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-3">
                      <Package className="text-green-600" size={32} />
                    </div>
                    <p className="text-gray-600 font-medium">All caught up! No pending dispatches.</p>
                  </div>
                )}
              </div>

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
              onClick={() => setShowReminders(true)}
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

        {/* 1. TOP KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

        {/* Graph section */}
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

            <SalesChart data={analytics.salesData} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sales chart — Chart.js via react-chartjs-2, replacing the hand-rolled SVG.
// The old version set the <svg> to width="100%" while its viewBox was sized
// in real pixels (data.length * 60). Those two don't agree, so on a narrow
// mobile screen the browser had to squash the whole viewBox down to fit —
// points overlapped and labels became unreadable instead of the intended
// "scroll sideways to see more points" behavior. That mismatch, plus
// recalculating `isMobile` from window.innerWidth only once per render
// (never on resize/rotate), is what made it feel broken on mobile.
const SalesChart = ({ data }) => {
  const chartRef = useRef(null);

  // Destroy the Chart.js instance on unmount — without this, switching
  // timeRange or navigating away and back can throw "Canvas is already
  // in use", which is a very plausible source of your earlier crashes.
  useEffect(() => {
    return () => {
      chartRef.current?.destroy?.();
    };
  }, []);

  const chartData = useMemo(
    () => ({
      labels: (data || []).map((point) => point.period),
      datasets: [
        {
          label: 'Revenue',
          data: (data || []).map((point) => point.revenue),
          borderColor: '#EB8A14',
          backgroundColor: 'rgba(235, 138, 20, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#EB8A14',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    }),
    [data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false, // wrapper div controls height, not the canvas
      resizeDelay: 100, // debounces resize handling, avoids ResizeObserver crash loops
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx) => `Rs. ${Number(ctx.parsed.y || 0).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `Rs. ${(value / 1000).toFixed(0)}k`,
          },
        },
      },
    }),
    []
  );

  if (!data || data.length === 0) {
    return (
      <div className="h-56 sm:h-64 flex items-center justify-center text-gray-400">
        <p>No sales data available</p>
      </div>
    );
  }

  // Height lives on this wrapper only — that's what fixes the mobile sizing.
  return (
    <div className="relative w-full h-56 sm:h-64">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default Dashboard;