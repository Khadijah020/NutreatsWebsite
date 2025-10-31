import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Pencil, ChevronDown, ChevronRight, Search, Trash2, Package } from 'lucide-react';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const [expandedProducts, setExpandedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch categories
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.category-dropdown-container')) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getCategoryName = (categoryName) => {
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === (categoryName || '').toLowerCase()
    );
    return category ? category.name : categoryName;
  };

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock });
      if (data.success) {
        await fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const { data } = await axios.post('/api/product/remove', { id });
      if (data.success) {
        await fetchProducts();
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
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const filteredProducts = useMemo(() => {
    let result = products || [];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (product) => (product.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          (product.name || '').toLowerCase().includes(term) ||
          (product.category || '').toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#faf7f2] py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 pb-3 mb-4 sm:pb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-100/60 rounded-lg sm:rounded-xl border border-amber-200/50">
              <Package className="text-[#AD3A24]" size={18} />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-[#8B2E1A]">All Products</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 w-full category-dropdown-container relative">
            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="w-full border border-amber-200/50 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white/80 flex justify-between items-center focus:ring-1 focus:ring-[#AD3A24]"
              >
                {selectedCategory}
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {categoryDropdownOpen && (
                <ul className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 border border-amber-200/50 bg-white/95 rounded-lg shadow-lg">
                  <li
                    className="px-3 py-2 cursor-pointer hover:bg-amber-100"
                    onClick={() => {
                      setSelectedCategory('All');
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    All Categories
                  </li>
                  {categories.map((cat) => (
                    <li
                      key={cat._id}
                      className="px-3 py-2 cursor-pointer hover:bg-amber-100 truncate"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-amber-200/50 rounded-lg w-full text-xs sm:text-sm bg-white/90 focus:ring-[#AD3A24]"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {(selectedCategory !== 'All' || searchTerm) && (
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Product Cards */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 border border-amber-200/20">
              <div className="bg-[#ecd4d0] rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100/60 border border-amber-200/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="text-[#AD3A24]" size={24} />
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {searchTerm || selectedCategory !== 'All'
                    ? 'No products found matching your filters.'
                    : 'No products available.'}
                </p>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="w-full bg-[#AD3A24] p-[1px] rounded-xl sm:rounded-2xl shadow-md">
                <div className="bg-[#ecd4d0] rounded-xl sm:rounded-2xl overflow-hidden">
                  {/* Main Row */}
                  <div className="p-2.5 sm:p-3 md:p-4 flex flex-col gap-2.5 sm:gap-3 w-full">
                    {/* Top Section: Image + Info */}
                    <div className="flex gap-2.5 sm:gap-3 items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={(product.image && product.image[0]) || ''}
                          alt={product.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border border-amber-200/50"
                        />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight">
                          {product.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 truncate leading-tight mt-0.5">
                          {getCategoryName(product.category)}
                        </p>

                        {/* Variants Button (Mobile) */}
                        {Array.isArray(product.weights) && product.weights.length > 0 && (
                          <button
                            onClick={() => toggleWeights(product._id)}
                            className="flex items-center gap-1 text-[#8B2E1A] text-[10px] sm:text-xs font-semibold hover:text-black transition mt-1"
                            aria-expanded={!!expandedProducts[product._id]}
                          >
                            {expandedProducts[product._id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span>{product.weights.length} variant{product.weights.length > 1 ? 's' : ''}</span>
                          </button>
                        )}

                        {/* Single Price (if no variants) */}
                        {(!Array.isArray(product.weights) || product.weights.length === 0) && (
                          <div className="text-xs sm:text-sm font-bold text-[#8B2E1A] mt-1">
                            {currency}{product.offerPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Section: Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-200/30">
                      {/* Stock Status Text */}
                      <span className={`text-[10px] sm:text-xs font-semibold ${product.inStock ? 'text-green-700' : 'text-gray-500'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Toggle switch */}
                        <label className="relative inline-flex items-center cursor-pointer" aria-label={product.inStock ? 'In stock' : 'Out of stock'}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!product.inStock}
                            onChange={() => toggleStock(product._id, !product.inStock)}
                            disabled={deletingId === product._id}
                            aria-checked={!!product.inStock}
                          />
                          <div className={`w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${deletingId === product._id ? 'bg-gray-200' : 'bg-gray-300 peer-checked:bg-[#AD3A24]'}`}></div>
                          <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4 sm:peer-checked:translate-x-5 ${deletingId === product._id ? 'opacity-50' : ''}`}></span>
                        </label>

                        <button
                          onClick={() => handleEdit(product._id)}
                          className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:text-[#8B2E1A] hover:bg-white/50 transition"
                          aria-label="Edit product"
                        >
                          <Pencil size={14} className="sm:w-4 sm:h-4" />
                        </button>

                        <button
                          onClick={() => handleRemove(product._id, product.name)}
                          className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                          disabled={deletingId === product._id}
                          aria-label="Delete product"
                        >
                          {deletingId === product._id ? (
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variants (mobile friendly) */}
                  {expandedProducts[product._id] && Array.isArray(product.weights) && product.weights.length > 0 && (
                    <div className="px-2.5 py-2.5 sm:px-3 sm:py-3 bg-white/50 border-t border-amber-200/50">
                      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {product.weights.map((w, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 bg-white border rounded-lg sm:rounded-xl px-2.5 py-2 min-w-[120px] sm:min-w-[140px] shadow"
                          >
                            <div className="text-xs sm:text-sm font-semibold text-gray-900">{w.weight}</div>
                            <div className="text-right mt-1">
                              <div className="text-[10px] sm:text-[11px] text-gray-500 line-through">{currency}{w.price}</div>
                              <div className="text-xs sm:text-sm font-bold text-[#AD3A24]">{currency}{w.offerPrice}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
