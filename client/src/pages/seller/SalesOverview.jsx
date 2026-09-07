import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const formatDateInput = (date) => date.toISOString().slice(0, 10);
const money = (currency, value) => `${currency} ${Number(value || 0).toLocaleString()}`;

const SalesOverview = () => {
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDateInput(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)));
  const [toDate, setToDate] = useState(formatDateInput(today));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/order/sellerOrders');
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message || 'Failed to load sales data');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T23:59:59.999`);

    return [...orders]
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= start && createdAt <= end;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, fromDate, toDate]);

  const summary = useMemo(() => {
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + (order.status === 'Delivered' || order.status === 'Paid' ? order.amount || 0 : 0),
      0
    );
    const totalOrders = filteredOrders.length;
    const paidOrders = filteredOrders.filter((order) => order.isPaid || order.status === 'Paid').length;
    const outstanding = filteredOrders.reduce(
      (sum, order) => sum + (!order.isPaid && !['Cancelled', 'Returned'].includes(order.status) ? order.amount || 0 : 0),
      0
    );

    return {
      totalSales,
      totalOrders,
      paidOrders,
      outstanding,
      averageOrderValue: totalOrders ? totalSales / totalOrders : 0,
    };
  }, [filteredOrders]);

  return (
    <div className="min-h-screen py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/seller/reports')}
            className="p-2 hover:bg-white rounded-xl transition border-2 border-[#EB8A14] shrink-0"
          >
            <ArrowLeft size={20} className="text-[#EB8A14]" />
          </button>
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md">
            <TrendingUp className="text-white" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sales Overview</h1>
            <p className="text-sm text-gray-600">Orders and sales across a custom date range</p>
          </div>
          <button
            onClick={fetchOrders}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#EB8A14] bg-white text-[#EB8A14] font-semibold hover:bg-[#fff7ec] transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <DateField label="From" value={fromDate} onChange={setFromDate} />
              <DateField label="To" value={toDate} onChange={setToDate} />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: '7D', days: 6 },
                { label: '30D', days: 29 },
                { label: '90D', days: 89 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - preset.days);
                    setFromDate(formatDateInput(start));
                    setToDate(formatDateInput(end));
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#EB8A14] hover:text-[#EB8A14] transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 sm:mb-6">
          <MetricCard label="Orders" value={summary.totalOrders} accent="text-emerald-700" />
          <MetricCard label="Sales" value={money(currency, summary.totalSales)} accent="text-blue-700" />
          <MetricCard label="Paid Orders" value={summary.paidOrders} accent="text-purple-700" />
          <MetricCard label="Outstanding" value={money(currency, summary.outstanding)} accent="text-rose-700" />
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Sales Transactions</h3>
            <p className="text-sm text-gray-500">Showing {filteredOrders.length} orders in the selected date range.</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading sales data...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No sales found for this date range.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Payment</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const customerName = getOrderCustomerName(order);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{customerName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{order.paymentType || 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{money(currency, order.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DateField = ({ label, value, onChange }) => (
  <label className="block">
    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      <Calendar size={16} className="text-[#EB8A14]" />
      {label}
    </span>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#EB8A14] outline-none text-sm"
    />
  </label>
);

const MetricCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
    <p className={`text-xl sm:text-2xl font-bold mt-2 ${accent}`}>{value}</p>
  </div>
);

const getOrderCustomerName = (order) => {
  if (order.guestAddress) {
    return `${order.guestAddress.firstName || ''} ${order.guestAddress.lastName || ''}`.trim() || order.guestAddress.phone || 'Guest';
  }

  if (order.address?.firstName || order.address?.lastName) {
    return `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim();
  }

  return order.userId?.name || `Order ${order._id.slice(-6).toUpperCase()}`;
};

const statusClass = (status) => {
  const classes = {
    Delivered: 'bg-green-100 text-green-700',
    Paid: 'bg-emerald-100 text-emerald-700',
    'Order Placed': 'bg-blue-100 text-blue-700',
    Confirmed: 'bg-purple-100 text-purple-700',
    Packed: 'bg-orange-100 text-orange-700',
    Dispatched: 'bg-indigo-100 text-indigo-700',
    Cancelled: 'bg-red-100 text-red-700',
    Returned: 'bg-gray-100 text-gray-700',
  };

  return classes[status] || 'bg-gray-100 text-gray-700';
};

export default SalesOverview;