import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, ChevronDown, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const money = (currency, value) => `${currency} ${Number(value || 0).toLocaleString()}`;

const PartyStatement = () => {
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, ordersRes] = await Promise.all([
        axios.get('/api/customer/all'),
        axios.get('/api/order/sellerOrders'),
      ]);

      if (customersRes.data.success) {
        setCustomers(customersRes.data.customers || []);
        setSelectedPartyId((current) => current || customersRes.data.customers?.[0]?._id || '');
      } else {
        toast.error(customersRes.data.message || 'Failed to load parties');
      }

      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders || []);
      } else {
        toast.error(ordersRes.data.message || 'Failed to load orders');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) => {
      const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim().toLowerCase();
      return (
        fullName.includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, searchTerm]);

  const selectedParty = useMemo(
    () => customers.find((customer) => customer._id === selectedPartyId) || null,
    [customers, selectedPartyId]
  );

  const partyOrders = useMemo(() => {
    if (!selectedParty) return [];

    return [...orders]
      .filter((order) => {
        const orderAddressId = typeof order.address === 'string' ? order.address : order.address?._id;
        const guestPhone = order.guestAddress?.phone;
        return orderAddressId?.toString() === selectedParty._id.toString() || guestPhone === selectedParty.phone;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [orders, selectedParty]);

  const summary = useMemo(() => {
    const totalSales = partyOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalReceived = partyOrders.reduce(
      (sum, order) => sum + (order.isPaid || order.status === 'Paid' ? order.amount || 0 : 0),
      0
    );
    const totalOutstanding = partyOrders.reduce(
      (sum, order) => sum + (!order.isPaid && !['Cancelled', 'Returned'].includes(order.status) ? order.amount || 0 : 0),
      0
    );

    return {
      totalSales,
      totalReceived,
      totalOutstanding,
      orderCount: partyOrders.length,
    };
  }, [partyOrders]);

  let runningBalance = 0;

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
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-md">
            <Users className="text-white" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Party Statement</h1>
            <p className="text-sm text-gray-600">Customer sales, dues, and payment history</p>
          </div>
          <button
            onClick={fetchData}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#EB8A14] bg-white text-[#EB8A14] font-semibold hover:bg-[#fff7ec] transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4 sm:p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search party..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#EB8A14] outline-none text-sm"
              />
            </div>

            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Select a party</div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredCustomers.map((customer) => {
                const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unnamed Party';
                const isActive = selectedPartyId === customer._id;

                return (
                  <button
                    key={customer._id}
                    onClick={() => setSelectedPartyId(customer._id)}
                    className={`w-full text-left p-3 rounded-2xl border transition ${
                      isActive
                        ? 'border-[#EB8A14] bg-[#fff7ec] shadow-sm'
                        : 'border-gray-200 hover:border-[#EB8A14]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{fullName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {customer.phone || customer.email || 'No contact details'}
                        </p>
                      </div>
                      <ChevronDown size={16} className="text-gray-400 shrink-0 rotate-[-90deg]" />
                    </div>
                  </button>
                );
              })}
              {!filteredCustomers.length && <p className="text-sm text-gray-500 py-6 text-center">No parties found.</p>}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-4 sm:p-6">
              {selectedParty ? (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">Selected Party</p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedParty.firstName} {selectedParty.lastName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedParty.phone || 'No phone'}{selectedParty.email ? ` • ${selectedParty.email}` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
                    <StatBox label="Orders" value={summary.orderCount} />
                    <StatBox label="Sales" value={money(currency, summary.totalSales)} />
                    <StatBox label="Received" value={money(currency, summary.totalReceived)} />
                    <StatBox label="Outstanding" value={money(currency, summary.totalOutstanding)} />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a party to view the statement.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Statement Ledger</h3>
                <p className="text-sm text-gray-500">Running balance is based on orders marked as paid or unpaid.</p>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading statement...</div>
              ) : !selectedParty ? (
                <div className="p-8 text-center text-gray-500">Select a party from the left panel.</div>
              ) : partyOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders found for this party.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 font-semibold">Reference</th>
                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                        <th className="text-right px-4 py-3 font-semibold">Invoice</th>
                        <th className="text-right px-4 py-3 font-semibold">Payment</th>
                        <th className="text-right px-4 py-3 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...partyOrders].map((order) => {
                        const invoiceAmount = order.amount || 0;
                        const paymentAmount = order.isPaid || order.status === 'Paid' ? invoiceAmount : 0;
                        runningBalance += invoiceAmount - paymentAmount;

                        return (
                          <tr key={order._id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">#{order._id.slice(-8).toUpperCase()}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                order.isPaid || order.status === 'Paid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.isPaid || order.status === 'Paid' ? 'Paid' : order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">{money(currency, invoiceAmount)}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{money(currency, paymentAmount)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800">{money(currency, runningBalance)}</td>
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
      </div>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-right sm:min-w-[96px]">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
    <p className="text-sm sm:text-base font-bold text-gray-800 mt-1 break-words">{value}</p>
  </div>
);

export default PartyStatement;