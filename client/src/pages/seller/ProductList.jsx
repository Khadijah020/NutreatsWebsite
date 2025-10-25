import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Pencil, ChevronDown, ChevronRight, Search, Trash2 } from 'lucide-react';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const [expandedProducts, setExpandedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch categories to display proper names
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}api/category/list`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [backendUrl]);

  // Get category display name from database
  const getCategoryName = (categoryName) => {
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.name : categoryName;
  };

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { data } = await axios.post('/api/product/remove', { id });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (productId) => navigate(`/seller/edit-product/${productId}`);
  const toggleWeights = (productId) =>
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">All Products</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {searchTerm ? 'No products found matching your search.' : 'No products available.'}
          </p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Main Product Row */}
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50 transition">
                {/* Product Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 rounded overflow-hidden shrink-0">
                    <img src={product.image[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-900 truncate text-sm sm:text-base">{product.name}</span>
                    <span className="text-xs text-gray-500 truncate">{getCategoryName(product.category)}</span>
                  </div>
                </div>

                {/* Price / Variant Toggle */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {product.weights?.length > 0 ? (
                    <button
                      onClick={() => toggleWeights(product._id)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-xs sm:text-sm font-medium"
                    >
                      {expandedProducts[product._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      {product.weights.length} variant{product.weights.length > 1 ? 's' : ''}
                    </button>
                  ) : (
                    <span className="text-sm font-semibold">{currency}{product.offerPrice}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={() => toggleStock(product._id, !product.inStock)}
                      className="sr-only peer"
                      disabled={deletingId === product._id}
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                  </label>
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Product"
                    disabled={deletingId === product._id}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(product._id, product.name)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Product"
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Weight Variants - Expands Below */}
              {expandedProducts[product._id] && product.weights?.length > 0 && (
                <div className="bg-gray-50 px-3 sm:px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {product.weights.map((weight, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center min-w-[120px] sm:min-w-[140px]"
                      >
                        <span className="text-gray-800 text-xs sm:text-sm font-medium">{weight.weight}</span>
                        <div className="text-right">
                          <div className="text-gray-400 text-[10px] sm:text-xs line-through">{currency}{weight.price}</div>
                          <div className="text-green-600 text-xs sm:text-sm font-medium">{currency}{weight.offerPrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <p className="text-sm text-gray-500 mt-3">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default ProductList;