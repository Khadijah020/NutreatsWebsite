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
      if (data.success) setCustomers(data.customers);
      else toast.error(data.message);
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
    <div className="min-h-screen bg-[#faf7f2] py-6 px-3 sm:py-8 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100/60 rounded-xl border border-amber-200/50">
              <Users className="text-[#AD3A24]" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#8B2E1A]">Customers</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Manage your customer database</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-amber-200/50 rounded-xl focus:ring-1 focus:ring-[#AD3A24] focus:border-[#AD3A24] outline-none bg-white placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
          {[
            { label: "Total", value: customers.length },
            { label: "With Email", value: customers.filter(c => c.email).length },
            { label: "Active", value: customers.filter(c => c.orderCount > 0).length },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-xl sm:rounded-2xl p-[2px] border border-amber-200/20">
              <div className="bg-[#ecd4d0] rounded-lg sm:rounded-xl p-2.5 sm:p-4">
                <p className="text-[11px] sm:text-sm text-gray-600 mb-1">{item.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-[#8B2E1A]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Customer List */}
        <div className="bg-[#ecd4d0] rounded-xl sm:rounded-2xl shadow border border-amber-200/30">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-10">
              <Users className="text-[#AD3A24] mx-auto mb-2" size={30} />
              <p className="text-sm text-gray-600">
                {searchTerm ? 'No results found.' : 'No customers yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-amber-200/50">
              {filteredCustomers.map(customer => (
                <div
                  key={customer._id}
                  className="p-3 sm:p-4 hover:bg-white/50 cursor-pointer transition group"
                  onClick={() => navigate(`/seller/customers/${customer._id}`)}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    
                    {/* Avatar */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#AD3A24] text-white font-semibold rounded-full flex items-center justify-center text-base sm:text-lg">
                      {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {customer.firstName} {customer.lastName}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-[11px] sm:text-sm text-gray-600">
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span className="flex items-center gap-1 max-w-[120px] sm:max-w-[200px] truncate">
                            <Mail size={12} />
                            {customer.email}
                          </span>
                        )}
                        {customer.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {customer.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Count */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className="text-[13px] sm:text-sm font-semibold text-[#8B2E1A] flex items-center gap-1">
                          <ShoppingBag size={14} />
                          {customer.orderCount || 0}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          {customer.orderCount === 1 ? "order" : "orders"}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-[#AD3A24]" />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        {searchTerm && (
          <p className="text-xs sm:text-sm text-gray-600 mt-3">
            Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default Customers;
