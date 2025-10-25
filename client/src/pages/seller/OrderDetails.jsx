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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600 mb-4">Order not found</p>
        <button
          onClick={() => navigate("/seller/orders")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const address = getOrderAddress(order);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/seller/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Order Details
            </h2>
            <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Payment Toggle Button */}
          <button
            onClick={togglePaymentStatus}
            disabled={updatingPayment}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              order.isPaid
                ? 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:border-red-300'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-md'
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
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${
              order.isPaid
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-yellow-50 text-yellow-700 border-yellow-300"
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Order Items
              </h3>
              <span className="ml-auto text-sm text-gray-500">
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
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                      <img
                        src={item.product?.image?.[0] || "/placeholder.png"}
                        alt={item.product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 truncate">
                        {item.product?.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        {item.product?.category && (
                          <span className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-medium text-green-700">
                            {item.product.category}
                          </span>
                        )}

                        {weightLabel && (
                          <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700">
                            {weightLabel}
                          </span>
                        )}

                        <span className="text-gray-500">Qty: {item.quantity}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">
                        {currency}
                        {itemTotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({currency}
                        {basePrice.toFixed(2)} each)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {currency}
                    {order.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-gray-900">{currency}0.00</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">
                    {currency}
                    {order.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Combined Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
            {/* Order Status */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="text-green-600" size={18} />
                <span className="text-sm font-medium text-gray-700">
                  Order Status
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">
                    {order.status || "Order Placed"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">
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
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="text-green-600" size={18} />
                <span className="text-sm font-medium text-gray-700">
                  Customer
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {address?.firstName} {address?.lastName}
                </p>
                {address?.email && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <span className="break-all">{address.email}</span>
                  </div>
                )}
                {address?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{address.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-green-600" size={18} />
                <span className="text-sm font-medium text-gray-700">
                  Delivery Address
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{address?.street}</p>
                <p>
                  {address?.city}, {address?.state}
                </p>
                <p>{address?.zipcode}</p>
                <p className="font-medium text-gray-900">
                  {address?.country}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="text-green-600" size={18} />
                <span className="text-sm font-medium text-gray-700">
                  Payment
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-medium ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-green-600">
                    {currency}
                    {order.amount.toFixed(2)}
                  </span>
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