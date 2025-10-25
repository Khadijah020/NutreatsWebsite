import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { Package, ChevronRight, Search, Calendar, CreditCard, User } from 'lucide-react'

const Orders = () => {
    const { currency, axios } = useAppContext()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller')
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.items.some(item =>
            item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'paid' && order.isPaid) ||
            (filterStatus === 'pending' && !order.isPaid)

        return matchesSearch && matchesFilter
    })

    const getStatusBadge = (isPaid) => {
        return isPaid
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Orders</h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product or customer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        <option value="all">All Orders</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Package className="mx-auto mb-3 text-gray-400" size={48} />
                        <p className="text-gray-500">
                            {searchTerm ? 'No orders found matching your search.' : 'No orders yet.'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order._id}
                            onClick={() => navigate(`/seller/orders/${order._id}`)}
                            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Order Items */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                                            <Package className="text-green-600" size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 mb-1">Order #{order._id.slice(-8)}</p>
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 text-sm truncate">
                                                            {item.product.name}
                                                        </p>
                                                        {item.weight && (
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                                {item.weight}
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-green-600 font-medium">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 lg:min-w-[200px]">
                                    <User size={16} className="text-gray-400 flex-shrink-0" />
                                    <div className="truncate">
                                        <p className="font-medium text-gray-900">
                                            {order.address.firstName} {order.address.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {order.address.city}, {order.address.state}
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {currency}{order.amount}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <CreditCard size={12} />
                                            <span>{order.paymentType}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Date */}
                                <div className="flex flex-col items-end gap-2 lg:min-w-[140px]">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.isPaid)}`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar size={12} />
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors hidden lg:block" size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Results count */}
            {searchTerm && (
                <p className="text-sm text-gray-500 mt-4">
                    Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    )
}

export default Orders