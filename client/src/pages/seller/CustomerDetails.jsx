import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit2, 
  X, 
  Save, 
  Package, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard 
} from 'lucide-react';

const CustomerDetails = () => {
  const { currency, axios } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchCustomerDetails = async () => {
    try {
      const { data } = await axios.get(`/api/customer/${id}`);
      if (data.success) {
        setCustomer(data.customer);
        setEditForm(data.customer);
        setOrders(data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const { data } = await axios.put(`/api/customer/${id}`, editForm);
      if (data.success) {
        setCustomer(data.customer);
        setIsEditing(false);
        toast.success('Customer updated successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-base sm:text-lg text-gray-600">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-base sm:text-lg text-gray-600 mb-4">Customer not found</p>
        <button
          onClick={() => navigate('/seller')}
          className="px-4 py-2 bg-[#EB8A14] text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base border-2 border-[#EB8A14]"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bfd9bde0] py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-[#bfd9bde0] rounded-xl transition border-2 border-[#EB8A14] shrink-0"
            >
              <ArrowLeft size={20} className="text-[#EB8A14]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#EB8A14]">Customer Details</h1>
              <p className="text-gray-600 text-sm">
                View and manage customer information
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#EB8A14] text-white rounded-xl hover:bg-orange-600 transition shadow-md border-2 border-[#EB8A14] w-full sm:w-auto"
            >
              <Edit2 size={16} />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(customer);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition border-2 border-[#EB8A14]"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleUpdateCustomer}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#EB8A14] text-white rounded-xl hover:bg-orange-600 transition shadow-md border-2 border-[#EB8A14]"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="p-6">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#EB8A14] rounded-full flex items-center justify-center border-4 border-[#bfd9bde0]">
                    <span className="text-white font-bold text-2xl">
                      {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Street Address
                      </label>
                      <textarea
                        value={editForm.street || ''}
                        onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                        rows="2"
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none resize-none bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          value={editForm.state || ''}
                          onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Zipcode
                      </label>
                      <input
                        type="text"
                        value={editForm.zipcode || ''}
                        onChange={(e) => setEditForm({...editForm, zipcode: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#EB8A14] mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editForm.country || ''}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center pb-4 border-b-2 border-[#EB8A14]">
                      <h2 className="text-xl font-bold text-[#EB8A14]">
                        {customer.firstName} {customer.lastName}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {customer.phone && (
                        <div className="flex items-start gap-3">
                          <Phone size={16} className="text-[#EB8A14] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-[#EB8A14]">Phone</p>
                            <p className="text-base text-gray-900 font-medium break-all">{customer.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {customer.email && (
                        <div className="flex items-start gap-3">
                          <Mail size={16} className="text-[#EB8A14] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-[#EB8A14]">Email</p>
                            <p className="text-base text-gray-900 font-medium break-all">{customer.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {(customer.street || customer.city) && (
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-[#EB8A14] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-[#EB8A14]">Address</p>
                            <div className="text-base text-gray-900 font-medium">
                              {customer.street && <p>{customer.street}</p>}
                              <p>
                                {customer.city && `${customer.city}`}
                                {customer.state && `, ${customer.state}`}
                              </p>
                              {customer.zipcode && <p>{customer.zipcode}</p>}
                              {customer.country && <p>{customer.country}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            {!isEditing && (
              <div className="bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-[#EB8A14] mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#EB8A14]">Total Orders</span>
                      <span className="font-semibold text-[#EB8A14]">{orders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#EB8A14]">Total Spent</span>
                      <span className="font-semibold text-[#EB8A14]">
                        {currency}{orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#EB8A14]">Customer Since</span>
                      <span className="font-semibold text-[#EB8A14]">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-[#EB8A14]" size={18} />
                  <h2 className="text-lg font-semibold text-[#EB8A14]">Order History</h2>
                  <span className="ml-auto text-sm text-[#EB8A14]">{orders.length} orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white border-4 border-[#EB8A14] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="text-[#EB8A14]" size={24} />
                    </div>
                    <p className="text-[#EB8A14]">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="bg-white rounded-xl border-4 border-[#EB8A14] p-4 hover:bg-[#bfd9bde0]/80 transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#EB8A14]">Order #{order._id.slice(-8)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar size={12} className="text-[#EB8A14] shrink-0" />
                              <span className="text-sm text-gray-700">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#EB8A14]">{currency}{order.amount.toFixed(2)}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              order.isPaid
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                            }`}>
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#EB8A14]">
                          <CreditCard size={12} className="shrink-0" />
                          <span className="truncate">{order.paymentType}</span>
                          <span className="mx-1">•</span>
                          <Package size={12} className="shrink-0" />
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;