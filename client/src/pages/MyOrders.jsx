import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useAppContext } from '../context/AppContext';
import { ChevronRight, Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, currency, navigate } = useAppContext();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
      case 'out for delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <>
      <SEO
        title="My Orders | NuTreats"
        description="View and track your order history"
        url="http://localhost:5173/my-orders"
        canonicalUrl="http://localhost:5173/my-orders"
        noindex={true}
        nofollow={true}
      />

      <div className="min-h-screen bg-[#faf7f2] px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <a href="/" className="hover:text-[#AD3A24] transition">Home</a>
              </li>
              <li><ChevronRight size={16} /></li>
              <li aria-current="page" className="text-[#AD3A24] font-medium">
                My Orders
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-[#AD3A24]" />
            <h1 className="text-3xl font-bold text-[#8B2E1A]">My Orders</h1>
          </div>

          {loading ? (
            <div className="bg-linear-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden">
              <div className="bg-[#ecd4d0] rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#AD3A24] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-linear-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
              
              <div className="bg-[#ecd4d0] rounded-2xl p-12 text-center relative">
                <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                
                <Package className="w-20 h-20 text-[#AD3A24]/30 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-[#8B2E1A] mb-3">No Orders Yet</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't placed any orders yet. Start exploring our premium collection!
                </p>
                <a
                  href="/products"
                  className="inline-block bg-[#AD3A24] hover:bg-[#8B2E1A] text-white font-semibold px-8 py-3 rounded-full transition shadow-md"
                >
                  Start Shopping
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <article
                  key={order._id}
                  className="bg-linear-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden hover:shadow-xl transition"
                >
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
                  
                  <div className="bg-[#ecd4d0] rounded-2xl p-5 sm:p-6 relative">
                    <div className="absolute top-2 right-2 w-10 h-10 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                    <div className="absolute bottom-2 left-2 w-10 h-10 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                    
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5 border-b-2 border-amber-200/50">
                      <div>
                        <h3 className="text-xl font-bold text-[#8B2E1A] mb-2">
                          Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4" />
                            <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-5">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-white/60 rounded-xl p-3 border border-amber-200/50"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-amber-200/50 flex items-center justify-center">
                            <img
                              src={item.product?.image?.[0] || '/placeholder.png'}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                              {item.product?.name || 'Product'}
                            </h4>
                            {item.weight && (
                              <p className="text-gray-600 text-sm">Weight: {item.weight}</p>
                            )}
                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#AD3A24]">
                              {currency}{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                      {/* Delivery Address */}
                      <div className="bg-white/60 rounded-xl p-4 border border-amber-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-[#AD3A24]" />
                          <h4 className="font-semibold text-gray-800 text-sm">Delivery Address</h4>
                        </div>
                        <address className="text-gray-600 text-sm not-italic leading-relaxed">
                          {order.address?.street || 'N/A'}<br />
                          {order.address?.city || ''}, {order.address?.state || ''}
                        </address>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-white/60 rounded-xl p-4 border border-amber-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-[#AD3A24]" />
                          <h4 className="font-semibold text-gray-800 text-sm">Payment</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                        </p>
                        <p className={`text-sm font-medium mt-1 ${
                          order.payment ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {order.payment ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-5 border-t-2 border-amber-200/50">
                      <span className="text-gray-700 font-semibold">Order Total</span>
                      <span className="text-2xl font-bold text-[#AD3A24]">
                        {currency}{order.amount || 0}
                      </span>
                    </div>

                    {/* Track Order Button */}
                    
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;