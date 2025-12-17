import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, User, ShoppingBag, Calculator, Minus, ArrowRight, Edit2, Download, FileText, Share2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

// PDF Generation Utility
const generateInvoicePDF = (orderData, customerInfo, selectedProducts, currency) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Nu Treats', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Phone no.: +923274571600', 15, 28);
  doc.text('Email: Nutreatsofficial@gmail.com', 15, 34);
  
  // Invoice Title (centered)
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(147, 137, 198); // Purple color
  doc.text('Invoice', 105, 55, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(15, 60, 195, 60);
  
  // Bill To Section (Left) and Invoice Details (Right)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To', 15, 72);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`${customerInfo.firstName} ${customerInfo.lastName}`, 15, 80);
  if (customerInfo.street) doc.text(`${customerInfo.street}`, 15, 86);
  if (customerInfo.city) doc.text(`${customerInfo.city}`, 15, 92);
  doc.text(`Contact No.: ${customerInfo.phone}`, 15, 98);
  
  // Invoice Details (Right side)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Invoice Details', 195, 72, { align: 'right' });
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No.: ${orderData._id || 'DRAFT'}`, 195, 80, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 86, { align: 'right' });
  
  // Table Header
  const tableTop = 110;
  doc.setFillColor(147, 137, 198); // Purple
  doc.rect(15, tableTop, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('#', 20, tableTop + 7);
  doc.text('Item name', 30, tableTop + 7);
  doc.text('Quantity', 120, tableTop + 7, { align: 'center' });
  doc.text('Price/unit', 155, tableTop + 7, { align: 'center' });
  doc.text('Amount', 185, tableTop + 7, { align: 'right' });
  
  // Table Rows
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  let yPos = tableTop + 17;
  let totalQty = 0;
  
  selectedProducts.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    const itemName = item.weight ? `${item.name} ${item.weight}` : item.name;
    totalQty += item.quantity;
    
    doc.text((index + 1).toString(), 20, yPos);
    doc.text(itemName.substring(0, 40), 30, yPos);
    doc.text(item.quantity.toString(), 120, yPos, { align: 'center' });
    doc.text(`${currency} ${item.offerPrice.toFixed(2)}`, 155, yPos, { align: 'center' });
    doc.text(`${currency} ${(item.offerPrice * item.quantity).toFixed(2)}`, 185, yPos, { align: 'right' });
    
    yPos += 8;
  });
  
  // Total Row
  doc.setDrawColor(0, 0, 0);
  doc.line(15, yPos - 2, 195, yPos - 2);
  doc.setFont(undefined, 'bold');
  doc.text('Total', 30, yPos + 5);
  doc.text(totalQty.toString(), 120, yPos + 5, { align: 'center' });
  doc.text(`${currency} ${orderData.amount.toFixed(2)}`, 185, yPos + 5, { align: 'right' });
  
  yPos += 15;
  doc.line(15, yPos, 195, yPos);
  
  // Invoice Summary (Right side)
  yPos += 10;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  doc.text('Sub Total', 140, yPos);
  doc.text(`${currency} ${orderData.amount.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFillColor(147, 137, 198);
  doc.rect(140, yPos - 5, 55, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('Total', 143, yPos);
  doc.text(`${currency} ${orderData.amount.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  yPos += 8;
  doc.text('Received', 140, yPos);
  doc.text(`${currency} 0.00`, 185, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('Balance', 140, yPos);
  doc.text(`${currency} ${orderData.amount.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('Payment Mode', 140, yPos);
  doc.text(orderData.paymentType || 'Credit', 185, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('Previous Balance', 140, yPos);
  doc.text(`${currency} 0.00`, 185, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('Current Balance', 140, yPos);
  doc.text(`${currency} ${orderData.amount.toFixed(2)}`, 185, yPos, { align: 'right' });
  
  // Terms and Conditions (Left side)
  const termsY = yPos - 36;
  doc.setFont(undefined, 'bold');
  doc.text('Terms And Conditions', 15, termsY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Thank you for doing business with us.', 15, termsY + 7);
  doc.text('Please keep all pulses refrigerated.', 15, termsY + 13);
  doc.text('ALL ITEMS CAN BE RETURNED OR EXCHANGED', 15, termsY + 19);
  doc.text('WITHIN 7 DAYS.', 15, termsY + 25);
  
  return doc;
};
export default function CreateBill() {
  const { products, currency, axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [step, setStep] = useState(1);
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  
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

  // Load jsPDF library
  useEffect(() => {
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const proceedToProducts = () => {
    if (!customerInfo.firstName || !customerInfo.phone) {
      alert('Customer name and phone are required');
      return;
    }
    setStep(2);
  };

  const [addedAnimation, setAddedAnimation] = useState(null);

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

    setAddedAnimation(`${product._id}-null`);
    setTimeout(() => setAddedAnimation(null), 600);
  };

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

    setAddedAnimation(`${product._id}-${weight.weight}`);
    setTimeout(() => setAddedAnimation(null), 600);
  };

  const updateQuantity = (productId, weight, newQuantity) => {
    if (newQuantity < 1) {
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

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => {
      return sum + (item.offerPrice * item.quantity);
    }, 0);
  };

  const getVariantQuantity = (productId, weight) => {
    const variant = selectedProducts.find(
      p => p.productId === productId && p.weight === weight
    );
    return variant ? variant.quantity : 0;
  };

  const handleDownloadPDF = () => {
    if (!lastOrder) return;
    
    const doc = generateInvoicePDF(lastOrder, customerInfo, selectedProducts, currency);
    doc.save(`invoice-${lastOrder._id}.pdf`);
    alert('PDF downloaded successfully!');
  };

  const handleViewPDF = () => {
    if (!lastOrder) return;
    
    const doc = generateInvoicePDF(lastOrder, customerInfo, selectedProducts, currency);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const handleSharePDF = async () => {
    if (!lastOrder) return;
    
    const doc = generateInvoicePDF(lastOrder, customerInfo, selectedProducts, currency);
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], `invoice-${lastOrder._id}.pdf`, { type: 'application/pdf' });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: `Invoice for ${customerInfo.firstName} ${customerInfo.lastName}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      alert('Sharing not supported on this device. Use Download instead.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
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
        setLastOrder({ ...orderData, _id: data.order._id });
        setShowPDFOptions(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
    setShowPDFOptions(false);
    setLastOrder(null);
  };

  const total = calculateTotal();

  // PDF Options Modal
  if (showPDFOptions) {
    return (
      <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
          <div className="bg-[#bfd9bde0] rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#EB8A14] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">Bill Created Successfully!</h2>
              <p className="text-gray-600">Invoice #{lastOrder?._id}</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 bg-[#EB8A14] hover:bg-orange-600 text-white font-semibold rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 border-2 border-[#EB8A14]"
              >
                <Download size={20} />
                Download PDF
              </button>

              <button
                onClick={handleViewPDF}
                className="w-full py-3 bg-white hover:bg-gray-50 text-[#EB8A14] font-semibold rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 border-2 border-[#EB8A14]"
              >
                <FileText size={20} />
                View PDF
              </button>

              <button
                onClick={handleSharePDF}
                className="w-full py-3 bg-white hover:bg-gray-50 text-[#EB8A14] font-semibold rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 border-2 border-[#EB8A14]"
              >
                <Share2 size={20} />
                Share PDF
              </button>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
            >
              Create New Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Customer Details
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#bfd9bde0] flex justify-center items-start py-8 md:py-12">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">Create New Bill</h1>
            <p className="text-black mt-2">Enter customer details to get started</p>
          </div>

          <div className="bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
            <div className="bg-[#bfd9bde0] rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white rounded-xl border-2 border-[#EB8A14]">
                  <User className="text-[#EB8A14]" size={22} />
                </div>
                <h2 className="text-xl font-semibold text-black">Customer Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      First Name <span className="text-[#EB8A14]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                      className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                      className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">
                    Phone Number <span className="text-[#EB8A14]">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Street Address</label>
                  <textarea
                    placeholder="Enter street address"
                    value={customerInfo.street}
                    onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                    rows="2"
                    className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none resize-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">State</label>
                    <input
                      type="text"
                      placeholder="Enter state"
                      value={customerInfo.state}
                      onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                      className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Zipcode</label>
                  <input
                    type="text"
                    placeholder="Enter zipcode"
                    value={customerInfo.zipcode}
                    onChange={(e) => setCustomerInfo({...customerInfo, zipcode: e.target.value})}
                    className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Payment Method</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Cash">Cash (Paid)</option>
                    <option value="Card">Card Payment</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <button
                  onClick={proceedToProducts}
                  className="w-full py-3 bg-[#EB8A14] hover:bg-orange-600 text-white font-semibold rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-6 shadow-md border-2 border-[#EB8A14]"
                >
                  Continue to Products
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bfd9bde0] py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Create Bill</h1>
            <p className="text-black mt-1">
              Customer: <span className="font-medium text-black">{customerInfo.firstName} {customerInfo.lastName}</span>
            </p>
          </div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-4 py-2 text-black hover:bg-white/50 rounded-xl transition border-2 border-[#EB8A14] bg-white"
          >
            <Edit2 size={16} />
            Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden">
              <div className="bg-[#bfd9bde0] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-xl border-2 border-[#EB8A14]">
                    <ShoppingBag className="text-[#EB8A14]" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-black">Add Products</h2>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#EB8A14]" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none bg-white"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-[#EB8A14] py-8">No products found</p>
                  ) : (
                    filteredProducts.map(product => (
                      <div key={product._id} className="border-2 border-[#EB8A14] rounded-xl p-3 hover:border-orange-600 transition bg-white">
                        <div className="flex items-start gap-3">
                          <img 
                            src={product.image[0]} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded-xl shrink-0 border-2 border-[#EB8A14]" 
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-[#EB8A14] mb-2">{product.category}</p>
                            
                            {product.weights && product.weights.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {product.weights.map((weight, idx) => {
                                  const qty = getVariantQuantity(product._id, weight.weight);
                                  const animKey = `${product._id}-${weight.weight}`;
                                  const isAnimating = addedAnimation === animKey;
                                  
                                  return qty > 0 ? (
                                    <div 
                                      key={idx} 
                                      className={`flex items-center gap-1 bg-[#EB8A14] text-white rounded-xl px-2 py-1.5 transition-all duration-300 border-2 border-[#EB8A14] ${
                                        isAnimating ? 'scale-110 ring-2 ring-orange-400' : ''
                                      }`}
                                    >
                                      <button
                                        onClick={() => updateQuantity(product._id, weight.weight, qty - 1)}
                                        className="hover:bg-orange-600 rounded transition p-0.5 active:scale-95"
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="text-sm font-medium min-w-[50px] text-center">
                                        {weight.weight} ({qty})
                                      </span>
                                      <button
                                        onClick={() => addVariantToBill(product, weight)}
                                        className="hover:bg-orange-600 rounded transition p-0.5 active:scale-95"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      key={idx}
                                      onClick={() => addVariantToBill(product, weight)}
                                      className={`px-3 py-1.5 text-sm font-medium bg-white text-[#EB8A14] hover:bg-[#EB8A14] hover:text-white hover:scale-105 active:scale-95 rounded-xl transition-all duration-200 border-2 border-[#EB8A14] ${
                                        isAnimating ? 'bg-[#EB8A14] text-white scale-110' : ''
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
                                className={`px-4 py-1.5 bg-[#EB8A14] text-white rounded-xl font-medium hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm border-2 border-[#EB8A14] ${
                                  addedAnimation === `${product._id}-null` ? 'scale-110 ring-2 ring-orange-400' : ''
                                }`}
                              >
                                Add
                              </button>
                            )}
                          </div>
                          
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border-4 border-[#EB8A14] overflow-hidden sticky top-6">
              <div className="bg-[#bfd9bde0] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-xl border-2 border-[#EB8A14]">
                    <Calculator className="text-[#EB8A14]" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-black">Bill Summary</h2>
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-white border-2 border-[#EB8A14] rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="text-[#EB8A14]" size={24} />
                    </div>
                    <p className="text-[#EB8A14] text-sm">No items added</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {selectedProducts.map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded-xl border-2 border-[#EB8A14]">
                          <div className="flex gap-2 items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              {item.weight && <p className="text-[#EB8A14] text-xs">{item.weight}</p>}
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <p className="text-[#EB8A14] text-xs">
                                {item.quantity} × {currency}{item.offerPrice}
                              </p>
                              <p className="font-semibold text-[#EB8A14]">
                                {currency}{(item.offerPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-[#bfd9bde0] rounded-lg px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                                className="p-1 hover:bg-white rounded transition"
                              >
                                <Minus size={14} className="text-[#EB8A14]" />
                              </button>
                              <span className="text-sm font-medium text-[#EB8A14] min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                                className="p-1 hover:bg-white rounded transition"
                              >
                                <Plus size={14} className="text-[#EB8A14]" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeProduct(index)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-600"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t-2 border-[#EB8A14]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-[#EB8A14]">Total</span>
                        <span className="text-2xl font-bold text-[#EB8A14]">{currency}{total.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl text-white font-semibold transition-transform shadow-md border-2 border-[#EB8A14] ${
                          loading ? 'bg-gray-400 cursor-not-allowed border-gray-400' : 'bg-[#EB8A14] hover:bg-orange-600 hover:scale-[1.02]'
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
      </div>
    </div>
  );
}