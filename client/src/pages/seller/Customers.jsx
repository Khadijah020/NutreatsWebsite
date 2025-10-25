import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Users, Search, ShoppingBag, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

const Customers = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('/api/customer/all');
      if (data.success) {
        setCustomers(data.customers);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-gray-600">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-2.5 bg-green-50 rounded-lg">
            <Users className="text-green-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Manage your customer database</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">With Email</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {customers.filter(c => c.email).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Active</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {customers.filter(c => c.orderCount > 0).length}
          </p>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                onClick={() => navigate(`/seller/customers/${customer._id}`)}
                className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition group"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-green-700 font-semibold text-sm sm:text-lg">
                      {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    
                    {/* Mobile: Stack vertically */}
                    <div className="flex flex-col gap-1 sm:hidden text-xs text-gray-600">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Desktop: Horizontal */}
                    <div className="hidden sm:flex flex-wrap gap-3 text-sm text-gray-600">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        </div>
                      )}
                      {customer.city && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{customer.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Count */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                        <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {customer.orderCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 hidden sm:block">
                        {customer.orderCount === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition hidden sm:block" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
          Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default Customers;