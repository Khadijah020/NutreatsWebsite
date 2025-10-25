import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Search, User, ShoppingBag, Calculator, Minus, ArrowRight, Edit2 } from 'lucide-react';

export default function CreateBill() {
  const { products, currency, axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [step, setStep] = useState(1); // 1 = customer info, 2 = products
  
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'Pakistan'
  });

  const [paymentType, setPaymentType] = useState('Cash on Delivery');

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Proceed to products step
  const proceedToProducts = () => {
    if (!customerInfo.firstName || !customerInfo.phone) {
      toast.error('Customer name and phone are required');
      return;
    }
    setStep(2);
    toast.success('Customer details saved! Now add products.');
  };

  const [addedAnimation, setAddedAnimation] = useState(null);

  // Add product to bill with animation
  const addProductToBill = (product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product._id && !p.weight);
    
    if (existingProduct) {
      const updated = selectedProducts.map(p => 
        p.productId === product._id && !p.weight 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
      setSelectedProducts(updated);
    } else {
      const newProduct = {
        productId: product._id,
        name: product.name,
        image: product.image[0],
        price: product.price,
        offerPrice: product.offerPrice,
        quantity: 1,
        weight: null,
        weights: product.weights || []
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }

    // Trigger animation
    setAddedAnimation(`${product._id}-null`);
    setTimeout(() => setAddedAnimation(null), 600);
  };

  // Add product variant to bill with animation
  const addVariantToBill = (product, weight) => {
    const existingVariant = selectedProducts.find(
      p => p.productId === product._id && p.weight === weight.weight
    );

    if (existingVariant) {
      const updated = selectedProducts.map(p => 
        p.productId === product._id && p.weight === weight.weight
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
      setSelectedProducts(updated);
    } else {
      const newProduct = {
        productId: product._id,
        name: product.name,
        image: product.image[0],
        price: weight.price,
        offerPrice: weight.offerPrice,
        quantity: 1,
        weight: weight.weight,
        weights: []
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }

    // Trigger animation
    setAddedAnimation(`${product._id}-${weight.weight}`);
    setTimeout(() => setAddedAnimation(null), 600);
  };

  // Update quantity or remove if 0
  const updateQuantity = (productId, weight, newQuantity) => {
    if (newQuantity < 1) {
      // Remove from cart
      setSelectedProducts(selectedProducts.filter(
        p => !(p.productId === productId && p.weight === weight)
      ));
      return;
    }
    
    const updated = selectedProducts.map(p => 
      p.productId === productId && p.weight === weight
        ? { ...p, quantity: newQuantity }
        : p
    );
    setSelectedProducts(updated);
  };

  // Remove product
  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    toast.success('Product removed');
  };

  // Calculate totals
  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => {
      return sum + (item.offerPrice * item.quantity);
    }, 0);
  };

  // Check if variant is in cart
  const getVariantQuantity = (productId, weight) => {
    const variant = selectedProducts.find(
      p => p.productId === productId && p.weight === weight
    );
    return variant ? variant.quantity : 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: selectedProducts.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          weight: item.weight
        })),
        amount: calculateTotal(),
        address: customerInfo,
        paymentType,
        isPaid: paymentType === 'Cash' || paymentType === 'Card',
        status: 'Order Placed'
      };

      const { data } = await axios.post('/api/order/createBill', orderData);

      if (data.success) {
        toast.success('Bill created successfully!');
        setSelectedProducts([]);
        setCustomerInfo({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipcode: '',
          country: 'Pakistan'
        });
        setPaymentType('Cash on Delivery');
        setStep(1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  // Step 1: Customer Details
  if (step === 1) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-gray-600 mt-2">Enter customer details to get started</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <User className="text-green-600" size={22} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <textarea
                placeholder="Enter street address"
                value={customerInfo.street}
                onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                rows="2"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={customerInfo.state}
                  onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zipcode</label>
              <input
                type="text"
                placeholder="Enter zipcode"
                value={customerInfo.zipcode}
                onChange={(e) => setCustomerInfo({...customerInfo, zipcode: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Cash">Cash (Paid)</option>
                <option value="Card">Card Payment</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <button
              onClick={proceedToProducts}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              Continue to Products
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Add Products
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
          <p className="text-gray-600 mt-1">
            Customer: <span className="font-medium text-gray-900">{customerInfo.firstName} {customerInfo.lastName}</span>
          </p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <Edit2 size={16} />
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingBag className="text-green-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Add Products</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No products found</p>
              ) : (
                filteredProducts.map(product => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition">
                    <div className="flex items-start gap-3">
                      <img 
                        src={product.image[0]} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        
                        {product.weights && product.weights.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {product.weights.map((weight, idx) => {
                              const qty = getVariantQuantity(product._id, weight.weight);
                              const animKey = `${product._id}-${weight.weight}`;
                              const isAnimating = addedAnimation === animKey;
                              
                              return qty > 0 ? (
                                <div 
                                  key={idx} 
                                  className={`flex items-center gap-1 bg-green-600 text-white rounded-lg px-2 py-1.5 transition-all duration-300 ${
                                    isAnimating ? 'scale-110 ring-2 ring-green-400' : ''
                                  }`}
                                >
                                  <button
                                    onClick={() => updateQuantity(product._id, weight.weight, qty - 1)}
                                    className="hover:bg-green-700 rounded transition p-0.5 active:scale-95"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-medium min-w-[50px] text-center">
                                    {weight.weight} ({qty})
                                  </span>
                                  <button
                                    onClick={() => addVariantToBill(product, weight)}
                                    className="hover:bg-green-700 rounded transition p-0.5 active:scale-95"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  key={idx}
                                  onClick={() => addVariantToBill(product, weight)}
                                  className={`px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95 rounded-lg transition-all duration-200 ${
                                    isAnimating ? 'bg-green-100 text-green-700 scale-110' : ''
                                  }`}
                                >
                                  {weight.weight}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => addProductToBill(product)}
                            className={`px-4 py-1.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200 ${
                              addedAnimation === `${product._id}-null` ? 'scale-110 ring-2 ring-green-400' : ''
                            }`}
                          >
                            Add
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{currency}{product.offerPrice}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calculator className="text-green-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Bill Summary</h2>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 text-sm">No items added</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        {item.weight && <p className="text-gray-500 text-xs">{item.weight}</p>}
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-gray-900">
                          {item.quantity} × {currency}{item.offerPrice}
                        </p>
                        <p className="font-medium text-gray-900">
                          {currency}{(item.offerPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">{currency}{total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Creating Bill...' : 'Create Bill'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}