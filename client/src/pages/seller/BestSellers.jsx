import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const formatDateInput = (date) => date.toISOString().slice(0, 10);
const money = (currency, value) => `${currency} ${Number(value || 0).toLocaleString()}`;

const BestSellers = () => {
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('best'); // 'best' | 'non-performing'
  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDateInput(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)));
  const [toDate, setToDate] = useState(formatDateInput(today));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/order/sellerOrders'),
        axios.get('/api/product/list'), // adjust if your product list route differs
      ]);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders || []);
      else toast.error(ordersRes.data.message || 'Failed to load orders');

      if (productsRes.data.success) setProducts(productsRes.data.products || []);
      else toast.error(productsRes.data.message || 'Failed to load products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T23:59:59.999`);
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= start && createdAt <= end && !['Cancelled', 'Returned'].includes(order.status);
    });
  }, [orders, fromDate, toDate]);

  const productRows = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = typeof item.product === 'string' ? item.product : item.product?._id;
        const key = productId || `${item.name}-${item.weight || 'base'}`;
        const current = map.get(key) || {
          productId,
          name: item.weight ? `${item.name || 'Product'} (${item.weight})` : item.name || 'Product',
          units: 0,
          revenue: 0,
        };
        current.units += item.quantity || 0;
        current.revenue += (item.offerPrice || item.price || 0) * (item.quantity || 0);
        map.set(key, current);
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const soldProductIds = useMemo(
    () => new Set(productRows.map((r) => r.productId).filter(Boolean)),
    [productRows]
  );

  const nonPerformingProducts = useMemo(
    () => products.filter((p) => !soldProductIds.has(p._id)),
    [products, soldProductIds]
  );

  const summary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalUnits = filteredOrders.reduce(
      (sum, order) => sum + (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
      0
    );
    return {
      totalRevenue,
      totalUnits,
      soldCount: productRows.length,
      nonPerformingCount: nonPerformingProducts.length,
    };
  }, [filteredOrders, productRows.length, nonPerformingProducts.length]);

  return (
    <div className="min-h-screen py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/seller/reports')} className="p-2 hover:bg-white rounded-xl transition border-2 border-[#EB8A14] shrink-0">
            <ArrowLeft size={20} className="text-[#EB8A14]" />
          </button>
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-md">
            <Award className="text-white" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Product Performance</h1>
            <p className="text-sm text-gray-600">Best sellers and non-performing products by revenue</p>
          </div>
          <button onClick={fetchData} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#EB8A14] bg-white text-[#EB8A14] font-semibold hover:bg-[#fff7ec] transition">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateField label="From" value={fromDate} onChange={setFromDate} />
            <DateField label="To" value={toDate} onChange={setToDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 sm:mb-6">
          <MetricCard label="Revenue" value={money(currency, summary.totalRevenue)} accent="text-blue-700" />
          <MetricCard label="Units Sold" value={summary.totalUnits} accent="text-emerald-700" />
          <MetricCard label="Products Sold" value={summary.soldCount} accent="text-purple-700" />
          <MetricCard label="Non-Performing" value={summary.nonPerformingCount} accent="text-rose-700" />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('best')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${tab === 'best' ? 'bg-[#EB8A14] text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => setTab('non-performing')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${tab === 'non-performing' ? 'bg-[#EB8A14] text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}
          >
            <TrendingDown size={14} />
            Non-Performing
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : tab === 'best' ? (
            productRows.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No sales in this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Item</th>
                      <th className="text-right px-4 py-3 font-semibold">Units</th>
                      <th className="text-right px-4 py-3 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productRows.map((row) => (
                      <tr key={row.productId || row.name} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.units}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{money(currency, row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : nonPerformingProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Every product sold at least once in this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Product</th>
                    <th className="text-left px-4 py-3 font-semibold">Category</th>
                    <th className="text-left px-4 py-3 font-semibold">In Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nonPerformingProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
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
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#EB8A14] outline-none text-sm" />
  </label>
);

const MetricCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
    <p className={`text-xl sm:text-2xl font-bold mt-2 ${accent}`}>{value}</p>
  </div>
);

export default BestSellers;