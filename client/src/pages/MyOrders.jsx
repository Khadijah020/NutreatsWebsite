import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useAppContext } from '../context/AppContext';
import { ChevronRight, Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ArrowLeft } from "lucide-react";
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

      console.log("🔍 API RESPONSE (orders):", data);

      if (data.success) {
        setOrders(data.orders);

        console.log("🧾 FINAL ORDER OBJECTS STORED:", data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
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

      <div className="min-h-screen bg-[#f8faf7] px-4 sm:px-6 py-10 mt-16">
        <div className="max-w-6xl mx-auto">

          <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mb-4 transition-colors"
>
  <ArrowLeft size={20} />
  Back
</button>
          
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-[#785427] flex-wrap">
              <li><a href="/" className="hover:text-[#EB8A14] transition">Home</a></li>
              <li><ChevronRight size={16} /></li>
              <li aria-current="page" className="text-[#EB8A14] font-medium">My Orders</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#EB8A14] to-[#F2B469] p-2 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#0a6134]">My Orders</h1>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="group relative bg-[#bfd9bde0] rounded-2xl p-1 shadow-xl border border-[#F2B469]/20">
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#EB8A14]/30 rounded-tl-xl" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#EB8A14]/30 rounded-br-xl" />

              <div className="bg-white/50 rounded-xl p-12 text-center relative">
                <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#F2B469]/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#F2B469]/30 rounded-bl-lg" />

                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EB8A14] border-t-transparent mx-auto mb-4"></div>
                <p className="text-[#785427] font-medium">Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (

            /* EMPTY STATE */
            <div className="group relative bg-[#bfd9bde0] rounded-2xl p-1 shadow-xl border border-[#F2B469]/20 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#EB8A14]/30 rounded-tl-xl" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#EB8A14]/30 rounded-br-xl" />

              <div className="bg-white/50 rounded-xl p-12 text-center relative">
                <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#F2B469]/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#F2B469]/30 rounded-bl-lg" />

                <Package className="w-20 h-20 text-[#EB8A14]/30 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#0a6134] mb-3">No Orders Yet</h2>
                <p className="text-[#785427] mb-6 max-w-md mx-auto">
                  You haven't placed any orders yet. Start exploring our premium collection!
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EB8A14] to-[#96580D] hover:from-[#96580D] hover:to-[#EB8A14] text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#F2B469]/30"
                >
                  Start Shopping
                </a>
              </div>
            </div>

          ) : (

            /* ORDER LIST */
            <div className="space-y-6">
              {orders.map((order) => {

                console.log("🧾 PROCESSING ORDER:", order);

                return (
                  <article
                    key={order._id}
                    className="group relative bg-white rounded-xl p-0 shadow-md border-[4px] border-[#EB8A14] transition-all duration-500"
                  >
                    {/* Orange corner accents */}
                    <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-[#EB8A14]/50 rounded-tl-lg" />
                    <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-[#EB8A14]/50 rounded-br-lg" />

                    {/* Light Green inner card */}
                    <div className="bg-[#bfd9bd] rounded-lg p-0 relative">
                      <div className="p-5 sm:p-6">

                        {/* HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5 border-b-2 border-[#F2B469]/30">
                          <div>
                            <h3 className="text-xl font-bold text-[#0a6134] mb-2">
                              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-[#785427]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <span className="text-[#F2B469]">•</span>
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

                        {/* ITEMS */}
                        <div className="space-y-3 mb-5">
                          {order.items?.map((item, index) => {

                            console.log(`📦 ITEM ${index + 1}:`, item);

                            let itemPrice = 0;

                            // debug each step
                            console.log("🟠 offerPrice:", item.offerPrice);
                            console.log("🟠 price:", item.price);
                            console.log("🟠 product.offerPrice:", item.product?.offerPrice);
                            console.log("🟠 product.price:", item.product?.price);

                            if (item.offerPrice !== undefined && item.offerPrice !== null) {
                              itemPrice = Number(item.offerPrice);
                            } else if (item.price !== undefined && item.price !== null) {
                              itemPrice = Number(item.price);
                            } else if (item.product?.offerPrice !== undefined) {
                              itemPrice = Number(item.product.offerPrice);
                            } else if (item.product?.price !== undefined) {
                              itemPrice = Number(item.product.price);
                            }

                            const itemQuantity = Number(item.quantity) || 1;
                            const itemTotal = itemPrice * itemQuantity;

                            console.log("🟢 FINAL PRICE:", itemPrice);
                            console.log("🟢 QUANTITY:", itemQuantity);
                            console.log("🟢 ITEM TOTAL:", itemTotal);

                            const productName = item.name || item.product?.name || 'Product';
                            const productImage = item.image || item.product?.image?.[0] || '/placeholder.png';

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-4 bg-white/80 rounded-xl p-3 border border-[#F2B469]/30"
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-[#F2B469]/30 flex items-center justify-center">
                                  <img
                                    src={productImage}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-semibold text-[#0a6134] text-sm sm:text-base">
                                    {productName}
                                  </h4>
                                  {item.weight && (
                                    <p className="text-[#785427] text-sm">Weight: {item.weight}</p>
                                  )}
                                  <p className="text-[#785427] text-sm">Qty: {itemQuantity}</p>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold text-[#96580D]">
                                    {currency}{itemTotal.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* ORDER DETAILS */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-5">
                          <div className="bg-white/80 rounded-xl p-4 border border-[#F2B469]/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-[#bfd9bd] p-1 rounded">
                                <MapPin className="w-4 h-4 text-[#0a6134]" />
                              </div>
                              <h4 className="font-semibold text-[#0a6134] text-sm">Delivery Address</h4>
                            </div>
                            <address className="text-[#785427] text-sm not-italic leading-relaxed">
                              {order.address?.street || 'N/A'}<br />
                              {order.address?.city || ''}, {order.address?.state || ''}
                            </address>
                          </div>

                          <div className="bg-white/80 rounded-xl p-4 border border-[#F2B469]/30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-[#bfd9bd] p-1 rounded">
                                <CreditCard className="w-4 h-4 text-[#0a6134]" />
                              </div>
                              <h4 className="font-semibold text-[#0a6134] text-sm">Payment</h4>
                            </div>
                            <p className="text-[#785427] text-sm">
                              {order.paymentType === 'COD' ? 'Cash on Delivery' : order.paymentType}
                            </p>
                            <p className={`text-sm font-medium mt-1 ${
                              order.isPaid ? 'text-green-600' : 'text-[#EB8A14]'
                            }`}>
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {/* TOTAL */}
                        <div className="flex items-center justify-between pt-5 border-t-2 border-[#F2B469]/30">
                          <span className="text-[#0a6134] font-semibold">Order Total</span>
                          <span className="text-2xl font-bold text-[#96580D]">
                            {currency}{(Number(order.amount) || 0).toFixed(2)}
                          </span>
                        </div>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default MyOrders;
