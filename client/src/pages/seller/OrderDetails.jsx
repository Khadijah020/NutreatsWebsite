import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Phone, Mail, User, Clock } from 'lucide-react'

const OrderDetails = () => {
    const { currency, axios } = useAppContext()
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.post('/api/order/id', { id })
            if (data.success) {
                setOrder(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrderDetails()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading order details...</div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-lg text-gray-600 mb-4">Order not found</p>
                <button
                    onClick={() => navigate('/seller/orders')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Back to Orders
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/seller/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Order Details</h2>
                        <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        order.isPaid
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                        {order.isPaid ? 'Paid' : 'Payment Pending'}
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
                            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
                            <span className="ml-auto text-sm text-gray-500">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {order.items.map((item, index) => {
                                // Calculate price from product's offerPrice
                                const itemPrice = item.product?.offerPrice || item.product?.price || 0
                                const itemTotal = itemPrice * item.quantity

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition-colors"
                                    >
                                        <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.product?.image?.[0] || '/placeholder.png'}
                                                alt={item.product?.name || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 mb-1">{item.product?.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                {item.weight && (
                                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium">
                                                        {item.weight}
                                                    </span>
                                                )}
                                                <span className="text-gray-500">Qty: {item.quantity}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {currency}{itemTotal.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {currency}{itemPrice.toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{currency}{order.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium text-gray-900">{currency}0.00</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-green-600">{currency}{order.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Combined Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
                        {/* Order Status & Date */}
                        <div className="pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="text-green-600" size={18} />
                                <span className="text-sm font-medium text-gray-700">Order Status</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className="font-medium text-gray-900">{order.status || 'Order Placed'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Date</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="text-green-600" size={18} />
                                <span className="text-sm font-medium text-gray-700">Customer</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">
                                    {order.address.firstName} {order.address.lastName}
                                </p>
                                {order.address.email && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <Mail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="break-all">{order.address.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{order.address.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="text-green-600" size={18} />
                                <span className="text-sm font-medium text-gray-700">Delivery Address</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state}</p>
                                <p>{order.address.zipcode}</p>
                                <p className="font-medium text-gray-900">{order.address.country}</p>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="text-green-600" size={18} />
                                <span className="text-sm font-medium text-gray-700">Payment</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium text-gray-900">{order.paymentType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-semibold text-green-600">
                                        {currency}{order.amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails