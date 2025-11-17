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
            const { data } = await axios.get('/api/order/sellerOrders')
            if (data.success) setOrders(data.orders)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => { fetchOrders() }, [])

    const getOrderAddress = (order) => order.guestAddress || order.address

    const filteredOrders = orders.filter(order => {
        const address = getOrderAddress(order)
        const matchesSearch = order.items.some(item =>
            item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || (address ? `${address.firstName} ${address.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) : false)
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'paid' && order.isPaid) ||
            (filterStatus === 'pending' && !order.isPaid)
        return matchesSearch && matchesFilter
    })

    return (
        <div className="min-h-screen bg-[#bfd9bde0] py-3 px-3 sm:py-6 sm:px-4">
            <div className="w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-[#EB8A14] mb-3 sm:mb-4">Orders</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]" size={16} />
                            <input
                                type="text"
                                placeholder="Search by product or customer..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 sm:py-2.5 border-4 border-[#EB8A14] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB8A14] focus:border-transparent text-xs sm:text-sm bg-white text-black placeholder-gray-500"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border-4 border-[#EB8A14] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB8A14] focus:border-transparent text-xs sm:text-sm font-medium bg-white text-black"
                        >
                            <option value="all">All Orders</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3 sm:space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl sm:rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
                            <div className="bg-[#bfd9bde0] rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
                                <Package className="mx-auto mb-3 text-[#EB8A14]" size={40} />
                                <p className="text-black font-medium text-sm sm:text-base">
                                    {searchTerm ? 'No orders found matching your search.' : 'No orders yet.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const address = getOrderAddress(order)
                            return (
                                <div
                                    key={order._id}
                                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                                    className="bg-white rounded-2xl sm:rounded-3xl border-4 border-[#EB8A14] cursor-pointer group hover:shadow-lg transition-all relative overflow-hidden"
                                >
                                    <div className="bg-white p-3 sm:p-4 md:p-5">
                                        {/* Order Header */}
                                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                            <div className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl border-2 border-[#EB8A14] shrink-0">
                                                <Package className="text-[#EB8A14]" size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-[10px] sm:text-xs text-black font-medium">
                                                        Order #{order._id.slice(-8)}
                                                    </p>
                                                    {order.guestAddress && (
                                                        <span className="text-[10px] sm:text-xs bg-[#EB8A14] text-white px-1.5 py-0.5 rounded-full font-semibold border-2 border-[#EB8A14]">
                                                            Manual
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="bg-white rounded-lg p-2 sm:p-2.5 border-2 border-[#EB8A14] mb-2 sm:mb-3">
                                            <div className="space-y-1.5">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-black text-xs sm:text-sm leading-tight">
                                                                {item.product?.name || 'Unknown Product'}
                                                            </p>
                                                            {item.weight && (
                                                                <span className="inline-block mt-1 text-[10px] sm:text-xs bg-[#EB8A14] text-white px-1.5 py-0.5 rounded-full font-semibold border-2 border-[#EB8A14]">
                                                                    {item.weight}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs sm:text-sm text-[#EB8A14] font-bold shrink-0">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer Info - Different background to stand out */}
                                        <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border-2 border-[#EB8A14] mb-2 sm:mb-3">
                                            <User size={14} className="text-[#EB8A14] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                {address ? (
                                                    <>
                                                        <p className="font-semibold text-black text-xs sm:text-sm truncate leading-tight">
                                                            {address.firstName} {address.lastName}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs text-black truncate leading-tight">
                                                            {address.city}, {address.state}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-black">No address</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Row: Amount, Payment, Status, Date */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                <div className="bg-white px-2.5 py-1.5 rounded-lg border-2 border-[#EB8A14]">
                                                    <p className="text-sm sm:text-base font-bold text-black leading-tight">
                                                        {currency}{order.amount}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-black">
                                                        <CreditCard size={10} className="text-black" />
                                                        <span className="font-medium">{order.paymentType || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border-2 ${
                                                    order.isPaid
                                                        ? 'bg-green-100 text-green-700 border-green-300'
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                                }`}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-black bg-white px-2 py-1 rounded-lg border-2 border-[#EB8A14]">
                                                <Calendar size={10} className="text-[#EB8A14]" />
                                                <span className="font-medium whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: '2-digit'
                                                    })}
                                                </span>
                                                <ChevronRight className="text-[#EB8A14] transition-colors ml-1" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Results count */}
                {searchTerm && (
                    <p className="text-xs sm:text-sm text-black mt-3 sm:mt-4 font-medium">
                        Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Orders