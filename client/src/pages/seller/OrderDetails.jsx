import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";

const OrderDetails = () => {
  const { currency, axios } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.post("/api/order/id", { id });
      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle payment status
  const togglePaymentStatus = async () => {
    const newStatus = !order.isPaid;
    const confirmMessage = newStatus 
      ? 'Mark this order as paid?' 
      : 'Mark this order as unpaid? This will revert the payment status.';
    
    if (!confirm(confirmMessage)) return;

    setUpdatingPayment(true);
    try {
      const { data } = await axios.post("/api/order/toggle-payment", { 
        orderId: id,
        isPaid: newStatus 
      });
      if (data.success) {
        toast.success(data.message);
        setOrder({ ...order, isPaid: newStatus });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Helper function to get the correct address
  const getOrderAddress = (order) => {
    if (order.guestAddress) {
      return order.guestAddress;
    }
    return order.address;
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#bfd9bde0]">
        <div className="text-lg text-[#EB8A14]">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#bfd9bde0]">
        <p className="text-lg text-[#EB8A14] mb-4">Order not found</p>
        <button
          onClick={() => navigate("/seller/orders")}
          className="px-4 py-2 bg-[#EB8A14] text-white rounded-lg hover:bg-orange-600 border-2 border-[#EB8A14]"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const address = getOrderAddress(order);

  return (
    <div className="min-h-screen bg-[#bfd9bde0] py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors border-2 border-[#EB8A14] bg-white"
            >
              <ArrowLeft size={20} className="text-[#EB8A14]" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#EB8A14]">
                Order Details
              </h2>
              <p className="text-sm text-black">Order #{order._id.slice(-8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Payment Toggle Button */}
            <button
              onClick={togglePaymentStatus}
              disabled={updatingPayment}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                order.isPaid
                  ? 'bg-white text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400'
                  : 'bg-[#EB8A14] text-white border-[#EB8A14] hover:bg-orange-600 hover:border-orange-600'
              }`}
            >
              {updatingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : order.isPaid ? (
                <>
                  <XCircle size={18} />
                  <span>Mark as Unpaid</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Mark as Paid</span>
                </>
              )}
            </button>

            {/* Status Badge */}
            <span
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                order.isPaid
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300"
              }`}
            >
              {order.isPaid ? "✓ Paid" : "⏳ Pending"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products Card */}
            <div className="bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-[#EB8A14]" size={20} />
                  <h3 className="text-lg font-semibold text-[#EB8A14]">
                    Order Items
                  </h3>
                  <span className="ml-auto text-sm text-black">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, index) => {
                    const weightLabel = item.weight;
                    
                    let basePrice = item.product?.offerPrice || item.product?.price || 0;
                    
                    if (item.weight && item.product?.weights && item.product.weights.length > 0) {
                      const matchingWeight = item.product.weights.find(w => w.weight === item.weight);
                      if (matchingWeight) {
                        basePrice = matchingWeight.offerPrice || matchingWeight.price;
                      }
                    }
                    
                    const itemTotal = basePrice * item.quantity;

                    return (
                      <div
                        key={`${item.product?._id}-${index}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-[#EB8A14] hover:border-orange-600 transition-colors"
                      >
                        <div className="w-16 h-16 bg-white rounded-xl border-2 border-[#EB8A14] overflow-hidden shrink-0">
                          <img
                            src={item.product?.image?.[0] || "/placeholder.png"}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-black mb-1 truncate">
                            {item.product?.name}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {item.product?.category && (
                              <span className="px-2 py-1 bg-[#EB8A14] text-white border-2 border-[#EB8A14] rounded text-xs font-semibold">
                                {item.product.category}
                              </span>
                            )}

                            {weightLabel && (
                              <span className="px-2 py-1 bg-[#EB8A14] text-white border-2 border-[#EB8A14] rounded text-xs font-semibold">
                                {weightLabel}
                              </span>
                            )}

                            <span className="text-black font-medium">Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-[#EB8A14]">
                            {currency}{itemTotal.toFixed(2)}
                          </p>
                          <p className="text-xs text-black">
                            ({currency}{basePrice.toFixed(2)} each)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t-2 border-[#EB8A14]">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black">Subtotal</span>
                      <span className="font-semibold text-black">
                        {currency}{order.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black">Delivery Fee</span>
                      <span className="font-semibold text-black">{currency}0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#EB8A14]">
                      <span className="text-black">Total</span>
                      <span className="text-[#EB8A14]">
                        {currency}{order.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Combined Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {/* Order Status */}
                <div className="pb-6 border-b-2 border-[#EB8A14]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="text-[#EB8A14]" size={18} />
                    <span className="text-sm font-semibold text-[#EB8A14]">
                      Order Status
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black">Status</span>
                      <span className="font-semibold text-black">
                        {order.status || "Order Placed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Order Date</span>
                      <span className="font-semibold text-black">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer */}
                <div className="pb-6 border-b-2 border-[#EB8A14]">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="text-[#EB8A14]" size={18} />
                    <span className="text-sm font-semibold text-[#EB8A14]">
                      Customer
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-black">
                      {address?.firstName} {address?.lastName}
                    </p>
                    {address?.email && (
                      <div className="flex items-start gap-2">
                        <Mail size={14} className="text-[#EB8A14] mt-0.5 shrink-0" />
                        <span className="break-all text-black">{address.email}</span>
                      </div>
                    )}
                    {address?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[#EB8A14] shrink-0" />
                        <span className="text-black">{address.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="pb-6 border-b-2 border-[#EB8A14]">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-[#EB8A14]" size={18} />
                    <span className="text-sm font-semibold text-[#EB8A14]">
                      Delivery Address
                    </span>
                  </div>
                  <div className="text-sm text-black space-y-1">
                    <p>{address?.street}</p>
                    <p>
                      {address?.city}, {address?.state}
                    </p>
                    <p>{address?.zipcode}</p>
                    <p className="font-semibold">
                      {address?.country}
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="text-[#EB8A14]" size={18} />
                    <span className="text-sm font-semibold text-[#EB8A14]">
                      Payment
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black">Method</span>
                      <span className="font-semibold text-black">
                        {order.paymentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Status</span>
                      <span
                        className={`font-semibold ${
                          order.isPaid ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-[#EB8A14]">
                      <span className="text-black">Amount</span>
                      <span className="font-bold text-[#EB8A14]">
                        {currency}{order.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;