import React, { useEffect, useState, useRef } from "react";
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
  Truck,
  History,
  CheckCircle2,
  Sparkles,
  FileText,
  Printer,
} from "lucide-react";

const OrderDetails = () => {
  const { currency, axios } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingInfo, setTrackingInfo] = useState('');
  const printRef = useRef(null);

  const orderStatuses = [
    { 
      value: 'Order Placed', 
      label: 'Order Placed', 
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '📦',
      description: 'Order has been placed'
    },
    { 
      value: 'Confirmed', 
      label: 'Confirmed', 
      color: 'from-purple-400 to-purple-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: '✓',
      description: 'Order confirmed by seller'
    },
    { 
      value: 'Packed', 
      label: 'Packed', 
      color: 'from-orange-400 to-orange-600',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: '📦',
      description: 'Ready for dispatch'
    },
    { 
      value: 'Dispatched', 
      label: 'Dispatched', 
      color: 'from-indigo-400 to-indigo-600',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      icon: '🚚',
      description: 'Out for delivery'
    },
    { 
      value: 'Delivered', 
      label: 'Delivered', 
      color: 'from-teal-400 to-teal-600',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      icon: '✓',
      description: 'Successfully delivered'
    },
    { 
      value: 'Paid', 
      label: 'Paid', 
      color: 'from-emerald-400 to-emerald-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: '💰',
      description: 'Payment confirmed'
    },
    { 
      value: 'Cancelled', 
      label: 'Cancelled', 
      color: 'from-red-400 to-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '✕',
      description: 'Order cancelled'
    },
    { 
      value: 'Returned', 
      label: 'Returned', 
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '↩',
      description: 'Order returned'
    },
  ];

  const getStatusInfo = (status) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.post("/api/order/id", { id });
      if (data.success) {
        setOrder(data.order);
        setTrackingInfo(data.order.trackingInfo || '');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdatingStatus(true);
    try {
      const { data } = await axios.post("/api/order/update-status", { 
        orderId: id,
        status: selectedStatus,
        note: statusNote,
        trackingInfo: trackingInfo
      });
      if (data.success) {
        toast.success(data.message);
        setOrder(data.order);
        setShowStatusModal(false);
        setSelectedStatus('');
        setStatusNote('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const generatePackingSlip = () => {
    const printWindow = window.open('', '_blank');
    const address = getOrderAddress(order);
    
    const packingSlipHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip - Order #${order._id.slice(-8).toUpperCase()}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 8px;
              color: #333;
              text-transform: uppercase;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .section-content {
              padding-left: 10px;
              color: #444;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #333;
            }
            tr:hover {
              background-color: #f8f9fa;
            }
            .quantity {
              text-align: center;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PACKING SLIP</h1>
            <p>Order #${order._id.slice(-8).toUpperCase()}</p>
            <p>${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Name</div>
            <div class="section-content">
              ${address?.firstName} ${address?.lastName}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Delivery Address</div>
            <div class="section-content">
              ${address?.street}<br>
              ${address?.city}, ${address?.state}<br>
              ${address?.country}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Weight</th>
                  <th class="quantity">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name || item.product?.name || 'N/A'}</td>
                    <td>${item.weight || 'N/A'}</td>
                    <td class="quantity">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(packingSlipHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getOrderAddress = (order) => {
    if (order.guestAddress) return order.guestAddress;
    return order.address;
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#bfd9bd] to-[#a8c9a8]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#EB8A14]"></div>
          <p className="text-lg text-[#EB8A14] mt-4 font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#bfd9bd] to-[#a8c9a8]">
        <p className="text-lg text-[#EB8A14] mb-4 font-semibold">Order not found</p>
        <button
          onClick={() => navigate("/seller/orders")}
          className="px-6 py-3 bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white rounded-2xl hover:shadow-lg transition-all font-semibold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const address = getOrderAddress(order);
  const currentStatusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfd9bd] to-[#a8c9a8] py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[#EB8A14]/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#EB8A14] to-[#d97706] rounded-2xl">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#EB8A14] to-[#d97706] bg-clip-text text-transparent">
                  Update Order Status
                </h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Select New Status
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:border-[#EB8A14] focus:ring-4 focus:ring-[#EB8A14]/10 outline-none transition-all appearance-none font-semibold text-gray-800 cursor-pointer hover:border-[#EB8A14]/50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23EB8A14'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5rem'
                      }}
                    >
                      <option value="" className="text-gray-400">Choose status...</option>
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.icon} {status.label} - {status.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedStatus && (
                    <div className={`mt-3 p-4 ${getStatusInfo(selectedStatus).bgColor} ${getStatusInfo(selectedStatus).borderColor} border-2 rounded-xl`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusInfo(selectedStatus).icon}</span>
                        <div>
                          <p className={`font-bold ${getStatusInfo(selectedStatus).textColor}`}>
                            {getStatusInfo(selectedStatus).label}
                          </p>
                          <p className="text-xs text-gray-600">
                            {getStatusInfo(selectedStatus).description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tracking Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EB8A14]" size={20} />
                    <input
                      type="text"
                      value={trackingInfo}
                      onChange={(e) => setTrackingInfo(e.target.value)}
                      placeholder="e.g., TCS-12345"
                      className="w-full pl-12 pr-5 py-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:border-[#EB8A14] focus:ring-4 focus:ring-[#EB8A14]/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Add Note <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add any additional notes about this status change..."
                    className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:border-[#EB8A14] focus:ring-4 focus:ring-[#EB8A14]/10 outline-none transition-all h-28 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus('');
                    setStatusNote('');
                  }}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={updateOrderStatus}
                  disabled={updatingStatus || !selectedStatus}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                >
                  {updatingStatus ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-3 bg-white/90 hover:bg-white rounded-2xl transition-all shadow-lg hover:shadow-xl border-2 border-[#EB8A14]/20"
            >
              <ArrowLeft size={20} className="text-[#EB8A14]" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#EB8A14]">Order Details</h2>
              <p className="text-sm text-gray-700 font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Generate Packing Slip Button */}
            <button
              onClick={generatePackingSlip}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#EB8A14] text-[#EB8A14] rounded-2xl font-bold hover:bg-[#EB8A14] hover:text-white transition-all shadow-md hover:shadow-lg"
            >
              <FileText size={18} />
              <span>Packing Slip</span>
            </button>

            {/* Update Status Button */}
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              <Sparkles size={18} />
              <span>Update Status</span>
            </button>

            {/* Current Status Badge */}
            <div className={`px-6 py-3 rounded-2xl font-bold border-2 ${currentStatusInfo.bgColor} ${currentStatusInfo.textColor} ${currentStatusInfo.borderColor} shadow-md flex items-center gap-2`}>
              <span className="text-xl">{currentStatusInfo.icon}</span>
              <span>{currentStatusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-[#EB8A14]/20 overflow-hidden">
              <div className="bg-gradient-to-br from-[#dae7d9] to-[#c8dcc8] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl shadow-md">
                    <Package className="text-[#EB8A14]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#EB8A14]">Order Items</h3>
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, index) => {
                    const basePrice = item.offerPrice || item.price || 0;
                    const itemTotal = basePrice * item.quantity;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-[#EB8A14]/30"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-[#EB8A14]/20">
                          <img
                            src={item.image || item.product?.image?.[0] || "/placeholder.png"}
                            alt={item.name || item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 mb-2 truncate text-lg">
                            {item.name || item.product?.name}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2">
                            {item.weight && (
                              <span className="px-3 py-1 bg-gradient-to-r from-[#EB8A14] to-[#d97706] text-white rounded-full text-xs font-bold shadow-md">
                                {item.weight}
                              </span>
                            )}
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold bg-gradient-to-r from-[#EB8A14] to-[#d97706] bg-clip-text text-transparent">
                            Rs. {itemTotal.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            Rs. {basePrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t-2 border-[#EB8A14]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Grand Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#EB8A14] to-[#d97706] bg-clip-text text-transparent">
                      Rs. {order.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border-2 border-[#EB8A14]/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#EB8A14] to-[#d97706] rounded-xl shadow-md">
                    <History className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#EB8A14]">Status Timeline</h3>
                </div>

                <div className="space-y-4">
                  {order.statusHistory.slice().reverse().map((history, index) => {
                    const statusInfo = getStatusInfo(history.status);
                    return (
                      <div key={index} className={`flex gap-4 p-4 rounded-2xl ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-md text-2xl">
                          {statusInfo.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${statusInfo.textColor} mb-1`}>
                            {history.status}
                          </p>
                          {history.note && (
                            <p className="text-sm text-gray-700 mb-2">{history.note}</p>
                          )}
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-[#EB8A14]/20 p-6 space-y-6">
              {/* Order Info */}
              <div className="pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-[#EB8A14]" size={20} />
                  <span className="text-sm font-bold text-[#EB8A14]">Order Information</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-bold text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {order.trackingInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking</span>
                      <span className="font-bold text-[#EB8A14]">{order.trackingInfo}</span>
                    </div>
                  )}
                  {order.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date</span>
                      <span className="font-bold text-gray-800">
                        {new Date(order.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {order.deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered On</span>
                      <span className="font-bold text-gray-800">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-[#EB8A14]" size={20} />
                  <span className="text-sm font-bold text-[#EB8A14]">Customer</span>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-bold text-gray-800 text-base">
                    {address?.firstName} {address?.lastName}
                  </p>
                  {address?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-[#EB8A14]" />
                      <span className="text-gray-700">{address.phone}</span>
                    </div>
                  )}
                  {address?.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#EB8A14]" />
                      <span className="text-gray-700 break-all">{address.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-[#EB8A14]" size={20} />
                  <span className="text-sm font-bold text-[#EB8A14]">Delivery Address</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1 leading-relaxed">
                  <p>{address?.street}</p>
                  <p>{address?.city}, {address?.state}</p>
                  <p className="font-semibold">{address?.country}</p>
                </div>
              </div>

              {/* Payment */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-[#EB8A14]" size={20} />
                  <span className="text-sm font-bold text-[#EB8A14]">Payment</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-bold text-gray-800">{order.paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-bold ${order.isPaid ? "text-green-600" : "text-amber-600"}`}>
                      {order.isPaid ? "✓ Paid" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-xl bg-gradient-to-r from-[#EB8A14] to-[#d97706] bg-clip-text text-transparent">
                      Rs. {order.amount.toFixed(2)}
                    </span>
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