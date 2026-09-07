import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Pencil, ChevronDown, ChevronRight, Search, Trash2, Package, MoreVertical, Edit3, Save, X } from 'lucide-react';
import PriceListGenerator from '../../components/PriceListGenerator';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const [expandedProducts, setExpandedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Bulk update states
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [editedProducts, setEditedProducts] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/category/list`);
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
      if (!e.target.closest('.bulk-menu-container')) {
        setShowBulkMenu(false);
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

  // Bulk Edit Functions
  const enterBulkEditMode = () => {
    setBulkEditMode(true);
    setShowBulkMenu(false);
    // Initialize edited products with current values
    const initialEdits = {};
    filteredProducts.forEach(product => {
      initialEdits[product._id] = {
        _id: product._id,
        name: product.name,
        description: product.description || '',
        weights: product.weights ? [...product.weights] : [],
        price: product.price || 0,
        offerPrice: product.offerPrice || 0
      };
    });
    setEditedProducts(initialEdits);
  };

  const exitBulkEditMode = () => {
    if (Object.keys(getChangedProducts()).length > 0) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to exit?')) {
        return;
      }
    }
    setBulkEditMode(false);
    setEditedProducts({});
  };

  const updateProductField = (productId, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const updateWeightField = (productId, weightIndex, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        weights: prev[productId].weights.map((w, i) => 
          i === weightIndex ? { ...w, [field]: value } : w
        )
      }
    }));
  };

  const getChangedProducts = () => {
    const changes = {};
    
    Object.keys(editedProducts).forEach(productId => {
      const original = products.find(p => p._id === productId);
      const edited = editedProducts[productId];
      
      if (!original) return;
      
      const productChanges = {};
      
      // Check name
      if (edited.name !== original.name) {
        productChanges.name = edited.name;
      }
      
      // Check description
      if (edited.description !== (original.description || '')) {
        productChanges.description = edited.description;
      }
      
      // Check base price and offerPrice (for products without weights)
      if (!edited.weights || edited.weights.length === 0) {
        if (edited.price !== (original.price || 0)) {
          productChanges.price = edited.price;
        }
        if (edited.offerPrice !== (original.offerPrice || 0)) {
          productChanges.offerPrice = edited.offerPrice;
        }
      }
      
      // Check weights
      const weightChanges = [];
      if (edited.weights && original.weights) {
        edited.weights.forEach((editedWeight, index) => {
          const originalWeight = original.weights[index];
          if (originalWeight) {
            if (
              editedWeight.weight !== originalWeight.weight ||
              editedWeight.price !== originalWeight.price ||
              editedWeight.offerPrice !== originalWeight.offerPrice
            ) {
              weightChanges.push({ index, ...editedWeight });
            }
          }
        });
      }
      
      if (weightChanges.length > 0) {
        productChanges.weights = edited.weights;
      }
      
      if (Object.keys(productChanges).length > 0) {
        changes[productId] = { _id: productId, ...productChanges };
      }
    });
    
    return changes;
  };

  const getChangesSummary = (changes) => {
    let nameChanges = 0;
    let descChanges = 0;
    let weightChanges = 0;
    
    Object.values(changes).forEach(change => {
      if (change.name) nameChanges++;
      if (change.description) descChanges++;
      if (change.weights) weightChanges++;
    });
    
    return { nameChanges, descChanges, weightChanges };
  };

  const handleBulkUpdate = async () => {
    const changes = getChangedProducts();
    
    if (Object.keys(changes).length === 0) {
      toast.error('No changes detected');
      return;
    }
    
    const summary = getChangesSummary(changes);
    const parts = [];
    if (summary.nameChanges > 0) parts.push(`${summary.nameChanges} product name${summary.nameChanges > 1 ? 's' : ''}`);
    if (summary.descChanges > 0) parts.push(`${summary.descChanges} description${summary.descChanges > 1 ? 's' : ''}`);
    if (summary.weightChanges > 0) parts.push(`${summary.weightChanges} weight variant${summary.weightChanges > 1 ? 's' : ''}`);
    
    const message = `You are about to update ${parts.join(', ')}. Do you want to continue?`;
    
    if (!window.confirm(message)) return;
    
    setIsUpdating(true);
    
    try {
      const { data } = await axios.post('/api/product/bulk-update', {
        updates: Object.values(changes)
      });
      
      if (data.success) {
        toast.success(data.message || 'Products updated successfully');
        await fetchProducts();
        setBulkEditMode(false);
        setEditedProducts({});
      } else {
        toast.error(data.message || 'Failed to update products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update products');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#bfd9bde0] py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 pb-3 mb-4 sm:pb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-[#bfd9bde0] rounded-lg sm:rounded-xl border-2 border-[#EB8A14]">
                <Package className="text-[#EB8A14]" size={18} />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-black">All Products</h2>
            </div>

            {/* Bulk Edit Menu */}
            <div className="relative bulk-menu-container">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="p-2 rounded-lg border-2 border-[#EB8A14] bg-white hover:bg-[#bfd9bde0] transition"
                aria-label="More options"
              >
                <MoreVertical size={18} className="text-[#EB8A14]" />
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-[#EB8A14] rounded-lg shadow-lg z-20 min-w-[160px]">
                  <button
                    onClick={enterBulkEditMode}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#bfd9bde0] flex items-center gap-2 text-black"
                  >
                    <Edit3 size={14} />
                    Bulk Update
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Edit Actions */}
          {bulkEditMode && (
            <div className="bg-white border-2 border-[#EB8A14] rounded-lg p-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-black">Bulk Edit Mode</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkUpdate}
                  disabled={isUpdating || Object.keys(getChangedProducts()).length === 0}
                  className="px-3 py-1.5 bg-[#EB8A14] text-white rounded-lg text-sm font-semibold hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={exitBulkEditMode}
                  disabled={isUpdating}
                  className="px-3 py-1.5 border-2 border-gray-400 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <PriceListGenerator 
            products={products} 
            categories={categories} 
            currency={currency} 
          />

          {/* Filters */}
          <div className="flex flex-col gap-2 w-full category-dropdown-container relative">
            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="w-full border-2 border-[#EB8A14] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white flex justify-between items-center focus:ring-2 focus:ring-[#EB8A14]"
              >
                {selectedCategory}
                <ChevronDown size={16} className="text-black" />
              </button>

              {categoryDropdownOpen && (
                <ul className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 border-2 border-[#EB8A14] bg-white rounded-lg shadow-lg">
                  <li
                    className="px-3 py-2 cursor-pointer hover:bg-[#bfd9bde0] text-black"
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
                      className="px-3 py-2 cursor-pointer hover:bg-[#bfd9bde0] truncate text-black"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border-2 border-[#EB8A14] rounded-lg w-full text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#EB8A14] text-black placeholder-[#EB8A14]/60"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {(selectedCategory !== 'All' || searchTerm) && (
          <p className="text-xs sm:text-sm text-black mb-3">
            Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Product Cards */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border-4 border-[#EB8A14] p-6 sm:p-10 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#bfd9bde0] border-2 border-[#EB8A14] rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="text-black" size={24} />
              </div>
              <p className="text-black text-sm sm:text-base">
                {searchTerm || selectedCategory !== 'All'
                  ? 'No products found matching your filters.'
                  : 'No products available.'}
              </p>
            </div>
          ) : bulkEditMode ? (
            // Bulk Edit Table View
            <div className="bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#bfd9bde0] border-b-2 border-[#EB8A14]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-black">Image</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-black">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-black">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-black">Price / Variants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const edited = editedProducts[product._id];
                      const hasWeights = edited?.weights && edited.weights.length > 0;
                      
                      return (
                        <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <img
                              src={(product.image && product.image[0]) || ''}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={edited?.name || ''}
                              onChange={(e) => updateProductField(product._id, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <textarea
                              value={edited?.description || ''}
                              onChange={(e) => updateProductField(product._id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] min-h-[60px] resize-y"
                              rows="2"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {hasWeights ? (
                              <div className="space-y-2">
                                <div className="text-[10px] font-semibold text-gray-600 mb-1">Variants:</div>
                                {edited.weights.map((weight, index) => (
                                  <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200">
                                    <div className="flex-1 min-w-0">
                                      <label className="text-[9px] text-gray-500 block mb-0.5">Weight</label>
                                      <input
                                        type="text"
                                        value={weight.weight}
                                        onChange={(e) => updateWeightField(product._id, index, 'weight', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="e.g., 250g"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <label className="text-[9px] text-gray-500 block mb-0.5">Price</label>
                                      <input
                                        type="number"
                                        value={weight.price}
                                        onChange={(e) => updateWeightField(product._id, index, 'price', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <label className="text-[9px] text-gray-500 block mb-0.5">Offer Price</label>
                                      <input
                                        type="number"
                                        value={weight.offerPrice}
                                        onChange={(e) => updateWeightField(product._id, index, 'offerPrice', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-[10px] font-semibold text-gray-600 mb-1">Base Price:</div>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-2">
                                  <div>
                                    <label className="text-[9px] text-gray-500 block mb-0.5">Price</label>
                                    <input
                                      type="number"
                                      value={edited?.price || 0}
                                      onChange={(e) => updateProductField(product._id, 'price', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-gray-500 block mb-0.5">Offer Price</label>
                                    <input
                                      type="number"
                                      value={edited?.offerPrice || 0}
                                      onChange={(e) => updateProductField(product._id, 'offerPrice', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Normal Card View
            filteredProducts.map((product) => (
              <div key={product._id} className="w-full bg-white rounded-2xl border-4 border-[#EB8A14] overflow-hidden shadow-md">
                {/* Main Row */}
                <div className="p-2.5 sm:p-3 md:p-4 flex flex-col gap-2.5 sm:gap-3 w-full">
                  {/* Top Section: Image + Info */}
                  <div className="flex gap-2.5 sm:gap-3 items-center">
                    <div className="shrink-0">
                      <img
                        src={(product.image && product.image[0]) || ''}
                        alt={product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border-2 border-[#EB8A14]"
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-black truncate leading-tight mt-0.5">
                        {getCategoryName(product.category)}
                      </p>

                      {/* Variants Button (Mobile) */}
                      {Array.isArray(product.weights) && product.weights.length > 0 && (
                        <button
                          onClick={() => toggleWeights(product._id)}
                          className="flex items-center gap-1 text-black text-[10px] sm:text-xs font-semibold hover:text-orange-600 transition mt-1"
                          aria-expanded={!!expandedProducts[product._id]}
                        >
                          {expandedProducts[product._id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <span>{product.weights.length} variant{product.weights.length > 1 ? 's' : ''}</span>
                        </button>
                      )}

                      {/* Single Price (if no variants) */}
                      {(!Array.isArray(product.weights) || product.weights.length === 0) && (
                        <div className="text-xs sm:text-sm font-bold text-black mt-1">
                          {currency}{product.offerPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section: Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#EB8A14]">
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
                        <div className={`w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${deletingId === product._id ? 'bg-gray-200' : 'bg-gray-300 peer-checked:bg-[#EB8A14]'}`}></div>
                        <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4 sm:peer-checked:translate-x-5 ${deletingId === product._id ? 'opacity-50' : ''}`}></span>
                      </label>

                      <button
                        onClick={() => handleEdit(product._id)}
                        className="p-1.5 sm:p-2 rounded-lg text-black border-2 border-black hover:bg-[#bfd9bde0] transition"
                        aria-label="Edit product"
                      >
                        <Pencil size={14} className="sm:w-4 sm:h-4" />
                      </button>

                      <button
                        onClick={() => handleRemove(product._id, product.name)}
                        className="p-1.5 sm:p-2 rounded-lg text-red-600 border-2 border-red-600 hover:bg-red-50 transition disabled:opacity-50"
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
                  <div className="px-2.5 py-2.5 sm:px-3 sm:py-3 bg-[#bfd9bde0] border-t-2 border-[#EB8A14]">
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {product.weights.map((w, i) => (
                        <div
                          key={i}
                          className="shrink-0 bg-white border-2 border-[#EB8A14] rounded-lg sm:rounded-xl px-2.5 py-2 min-w-[120px] sm:min-w-[140px] shadow"
                        >
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{w.weight}</div>
                          <div className="text-right mt-1">
                            <div className="text-[10px] sm:text-[11px] text-gray-500 line-through">{currency}{w.price}</div>
                            <div className="text-xs sm:text-sm font-bold text-black">{currency}{w.offerPrice}</div>
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
      </div>
    </div>
  );
};

export default ProductList;