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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/seller')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              View and manage customer information
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
          >
            <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Edit Details</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm(customer);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleUpdateCustomer}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Customer Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-xl sm:text-2xl">
                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            {isEditing ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName || ''}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Street Address
                  </label>
                  <textarea
                    value={editForm.street || ''}
                    onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm.state || ''}
                      onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    value={editForm.zipcode || ''}
                    onChange={(e) => setEditForm({...editForm, zipcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editForm.country || ''}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h2>
                </div>

                <div className="space-y-3">
                  {customer.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium break-all">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Email</p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium break-all">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {(customer.street || customer.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Address</p>
                        <div className="text-sm sm:text-base text-gray-900 font-medium">
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

          {/* Stats Card */}
          {!isEditing && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm mt-4 sm:mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Statistics</h3>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-gray-900">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-green-600">
                    {currency}{orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-green-600" size={18} />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Order History</h2>
              <span className="ml-auto text-xs sm:text-sm text-gray-500">{orders.length} orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="text-gray-400" size={20} />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 hover:shadow-sm transition cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{currency}{order.amount.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium mt-1 ${
                          order.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
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
  );
};

export default CustomerDetails;