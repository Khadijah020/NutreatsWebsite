import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { Package, ChevronRight, Search, Calendar, CreditCard, User, Filter } from 'lucide-react'

const Orders = () => {
    const { currency, axios } = useAppContext()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [orders, setOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)

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

    // Set filter based on URL parameters when component mounts or URL changes
    useEffect(() => {
        const statusParam = searchParams.get('status')
        const paidParam = searchParams.get('paid')

        if (statusParam) {
            // Handle multiple statuses separated by comma (e.g., "Cancelled,Returned")
            const statuses = statusParam.split(',')
            
            // Find matching stage
            if (statuses.includes('Order Placed')) {
                setFilterStatus('new')
            } else if (statuses.includes('Packed')) {
                setFilterStatus('Packed')
            } else if (statuses.includes('Confirmed')) {
                setFilterStatus('confirmed')
            } else if (statuses.includes('Dispatched')) {
                setFilterStatus('dispatched')
            } else if (statuses.includes('Delivered')) {
                if (paidParam === 'false') {
                    setFilterStatus('unpaid')
                } else {
                    setFilterStatus('delivered')
                }
            } else if (statuses.includes('Cancelled') || statuses.includes('Returned')) {
                setFilterStatus('cancelled')
            } else if (statuses.includes('Completed')) {
                setFilterStatus('completed')
            }
        } else if (paidParam === 'true') {
            setFilterStatus('paid')
        } else if (paidParam === 'false') {
            setFilterStatus('unpaid')
        }
    }, [searchParams])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.filter-dropdown-container')) {
                setShowFilterDropdown(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const getOrderAddress = (order) => order.guestAddress || order.address

    // Order lifecycle stages with their corresponding statuses
    const orderStages = [
        { value: 'all', label: 'All Orders', statuses: [] },
        { value: 'new', label: 'New Orders', statuses: ['Order Placed'] },
        { value: 'confirmed', label: 'Confirmed', statuses: ['Confirmed'] },
        { value: 'Packed', label: 'Packed', statuses: ['Packed'] },
        { value: 'dispatched', label: 'Dispatched', statuses: ['Dispatched'] },
        { value: 'delivered', label: 'Delivered', statuses: ['Delivered'] },
        { value: 'completed', label: 'Completed', statuses: ['Completed'] },
        { value: 'cancelled', label: 'Cancelled/Returned', statuses: ['Cancelled', 'Returned'] },
        { value: 'unpaid', label: 'Unpaid', statuses: [] }, // Special filter
        { value: 'paid', label: 'Paid Only', statuses: [] }, // Special filter
    ]

    const getStatusBadgeColor = (status) => {
        const colors = {
            'Order Placed': 'bg-blue-100 text-blue-700 border-blue-300',
            'Confirmed': 'bg-purple-100 text-purple-700 border-purple-300',
            'Processing': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'Packed': 'bg-orange-100 text-orange-700 border-orange-300',
            'Dispatched': 'bg-indigo-100 text-indigo-700 border-indigo-300',
            'Delivered': 'bg-green-100 text-green-700 border-green-300',
            'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-300',
            'Cancelled': 'bg-red-100 text-red-700 border-red-300',
            'Returned': 'bg-gray-100 text-gray-700 border-gray-300',
        }
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
    }

    const filteredOrders = orders.filter(order => {
        const address = getOrderAddress(order)
        
        // Search filter
        const matchesSearch = searchTerm.trim() === '' || 
            order.items.some(item =>
                item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || 
            (address ? `${address.firstName} ${address.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
            order._id.slice(-8).toLowerCase().includes(searchTerm.toLowerCase())

        // Status/Stage filter
        let matchesFilter = true
        
        if (filterStatus !== 'all') {
            const selectedStage = orderStages.find(s => s.value === filterStatus)
            
            if (filterStatus === 'unpaid') {
                // Show only unpaid orders
                matchesFilter = !order.isPaid
            } else if (filterStatus === 'paid') {
                // Show only paid orders
                matchesFilter = order.isPaid
            } else if (selectedStage && selectedStage.statuses.length > 0) {
                // Show orders matching specific statuses
                matchesFilter = selectedStage.statuses.includes(order.status)
            }
        }

        return matchesSearch && matchesFilter
    })

    const getFilterLabel = () => {
        const stage = orderStages.find(s => s.value === filterStatus)
        return stage ? stage.label : 'All Orders'
    }

    // Count orders by stage
    const getStageCount = (stageValue) => {
        if (stageValue === 'all') return orders.length
        
        const stage = orderStages.find(s => s.value === stageValue)
        if (!stage) return 0
        
        if (stageValue === 'unpaid') {
            return orders.filter(o => !o.isPaid).length
        } else if (stageValue === 'paid') {
            return orders.filter(o => o.isPaid).length
        } else if (stage.statuses.length > 0) {
            return orders.filter(o => stage.statuses.includes(o.status)).length
        }
        
        return 0
    }

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
                                placeholder="Search by product, customer, or order ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 sm:py-2.5 border-4 border-[#EB8A14] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB8A14] focus:border-transparent text-xs sm:text-sm bg-white text-black placeholder-gray-500"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative filter-dropdown-container w-full sm:w-auto">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border-4 border-[#EB8A14] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB8A14] text-xs sm:text-sm font-medium bg-white text-black flex items-center justify-between gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-[#EB8A14]" />
                                    <span>{getFilterLabel()}</span>
                                </div>
                                <ChevronRight 
                                    size={16} 
                                    className={`text-[#EB8A14] transition-transform ${showFilterDropdown ? 'rotate-90' : ''}`}
                                />
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute z-20 top-full mt-2 left-0 right-0 sm:right-auto sm:w-64 bg-white border-4 border-[#EB8A14] rounded-xl shadow-lg max-h-96 overflow-y-auto">
                                    {orderStages.map((stage) => {
                                        const count = getStageCount(stage.value)
                                        return (
                                            <button
                                                key={stage.value}
                                                onClick={() => {
                                                    setFilterStatus(stage.value)
                                                    setShowFilterDropdown(false)
                                                }}
                                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#bfd9bde0] flex items-center justify-between group ${
                                                    filterStatus === stage.value ? 'bg-[#bfd9bde0] font-semibold' : ''
                                                }`}
                                            >
                                                <span className="text-black">{stage.label}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                                    filterStatus === stage.value 
                                                        ? 'bg-[#EB8A14] text-white' 
                                                        : 'bg-gray-200 text-gray-700 group-hover:bg-[#EB8A14] group-hover:text-white'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Summary */}
                    {(searchTerm || filterStatus !== 'all') && (
                        <p className="text-xs sm:text-sm text-black mt-3 font-medium">
                            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                            {filterStatus !== 'all' && ` in "${getFilterLabel()}"`}
                        </p>
                    )}
                </div>

                {/* Orders List */}
                <div className="space-y-3 sm:space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl sm:rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
                            <div className="bg-[#bfd9bde0] rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
                                <Package className="mx-auto mb-3 text-[#EB8A14]" size={40} />
                                <p className="text-black font-medium text-sm sm:text-base">
                                    {searchTerm || filterStatus !== 'all' 
                                        ? 'No orders found matching your filters.' 
                                        : 'No orders yet.'}
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
                                                    {/* Order Status Badge */}
                                                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-semibold border-2 ${getStatusBadgeColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg mb-2 sm:mb-3">
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

                                        {/* Order Items */}
                                        <div className="bg-[#dae7d9e0] rounded-lg p-2 sm:p-2.5 border-2 border-[#EB8A14] mb-2 sm:mb-3">
                                            <div className="space-y-1.5">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-serif text-black text-xs sm:text-sm leading-tight">
                                                                {item.product?.name || item.name || 'Unknown Product'}
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

                                        {/* Bottom Row: Amount, Payment, Date */}
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
                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
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
            </div>
        </div>
    )
}

export default Orders