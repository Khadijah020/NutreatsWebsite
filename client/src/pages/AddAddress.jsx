import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from "react-hot-toast";
import { ChevronRight, MapPin, User, Mail, Phone, Home, Info, Truck, Shield, CreditCard } from 'lucide-react';
import { ArrowLeft } from "lucide-react";
const InputField = ({ type, placeholder, name, handleChange, address, icon: Icon, optional = false, autocomplete }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]">
        <Icon size={18} />
      </div>
    )}
    <input
      className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-2 border-[#EB8A14] rounded-xl outline-none text-[#0a6134] bg-white focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-[#785427]/60 font-medium`}
      type={type}
      placeholder={placeholder + (optional ? ' (optional)' : '')}
      onChange={handleChange}
      name={name}
      value={address[name]}
      required={!optional}
      autoComplete={autocomplete}
    />
  </div>
);

const AddAddress = () => {
  const { axios, user, navigate, cartItems, products, currency, setCartItems } = useAppContext();
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    apartment: '',
    city: '',
    state: 'Punjab',
    zipcode: '',
    country: 'Pakistan',
    phone: '',
    paymentMethod: 'COD',
  });

  const [cartArray, setCartArray] = useState([]);

  const getCart = () => {
    const tempArray = [];
    const cartMeta = JSON.parse(localStorage.getItem('cartMeta') || '{}');
    
    for (const key in cartItems) {
      if (key.includes('_')) {
        const [productId, weight] = key.split('_');
        const product = products.find((item) => item._id === productId);
        
        if (product) {
          const weightVariant = product.weights?.find(w => w.weight === weight);
          
          if (weightVariant) {
            tempArray.push({
              ...product,
              cartKey: key,
              quantity: cartItems[key],
              selectedWeight: weight,
              displayPrice: weightVariant.price,
              displayOfferPrice: weightVariant.offerPrice
            });
          }
        }
      } else {
        const product = products.find((item) => item._id === key);
        if (product) {
          tempArray.push({
            ...product,
            cartKey: key,
            quantity: cartItems[key],
            selectedWeight: null,
            displayPrice: product.price,
            displayOfferPrice: product.offerPrice
          });
        }
      }
    }
    setCartArray(tempArray);
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  const cartSubtotal = cartArray.reduce(
    (sum, item) => sum + item.displayOfferPrice * item.quantity,
    0
  );
  const shippingFee = 250;
  const codFee = address.paymentMethod === 'COD' ? (cartSubtotal + shippingFee) * 0.02 : 0;
  const cartTotal = cartSubtotal + shippingFee + codFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'phone'];
    const missingFields = requiredFields.filter(field => !address[field].trim());
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const items = cartArray.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        weight: item.selectedWeight || null,
      }));

      if (!user) {
        const { data } = await axios.post("/api/order/cod", {
          items,
          address,
        });

        if (data.success) {
          toast.success("Order placed successfully!");
          setCartItems({});
          localStorage.removeItem("guestAddress");
          localStorage.removeItem("cartMeta");
          navigate("/order-success");
        } else {
          toast.error(data.message);
        }
        return;
      }

      const addressResponse = await axios.post("/api/address/add", address);
      
      if (!addressResponse.data.success) {
        toast.error(addressResponse.data.message);
        return;
      }

      const getUserAddresses = await axios.get("/api/address/get");
      
      if (getUserAddresses.data.success && getUserAddresses.data.addresses.length > 0) {
        const latestAddress = getUserAddresses.data.addresses[getUserAddresses.data.addresses.length - 1];
        
        const orderData = await axios.post("/api/order/cod", {
          userId: user._id,
          items,
          address: latestAddress._id,
        });

        if (orderData.data.success) {
          toast.success("Order placed successfully!");
          setCartItems({});
          localStorage.removeItem("cartMeta");
          navigate("/my-orders");
        } else {
          toast.error(orderData.data.message);
        }
      } else {
        toast.error("Could not retrieve address");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      toast("You're checking out as guest");
    }
  }, []);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #bfd9bde0;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EB8A14;
          border-radius: 10px;
          border: 2px solid #bfd9bde0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #96580D;
        }
      `}</style>
      <div className="min-h-screen bg-white px-4 sm:px-6 py-10 mt-16">
        <div className="max-w-7xl mx-auto">
          <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mb-4 transition-colors"
>
  <ArrowLeft size={20} />
  Back
</button>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-[#785427] flex-wrap">
              <li>
                <a href="/" className="hover:text-[#EB8A14] transition">Home</a>
              </li>
              <li><ChevronRight size={16} /></li>
              <li>
                <a href="/cart" className="hover:text-[#EB8A14] transition">Cart</a>
              </li>
              <li><ChevronRight size={16} /></li>
              <li aria-current="page" className="text-[#EB8A14] font-medium">
                Shipping Address
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
            {/* Left Side - Address Form */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-1 shadow-xl border-4 border-[#EB8A14]">
                <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8">
                  <form onSubmit={onSubmitHandler} className="space-y-6 lg:space-y-8">
                    {/* Contact Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white p-1.5 rounded-lg border-2 border-[#EB8A14]">
                          <Mail className="w-4 h-4 text-[#0a6134]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0a6134]">Contact</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <InputField 
                            handleChange={handleChange} 
                            address={address} 
                            name="email" 
                            type="email" 
                            placeholder="Email address"
                            icon={Mail}
                            autocomplete="email"
                          />
                          <p className="text-xs text-[#785427] mt-1 ml-1">Required for order updates</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#785427]">
                          <input type="checkbox" className="rounded border-[#EB8A14] text-[#EB8A14] focus:ring-[#EB8A14]" />
                          <span>Email me with news and offers</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white p-1.5 rounded-lg border-2 border-[#EB8A14]">
                          <Truck className="w-4 h-4 text-[#0a6134]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0a6134]">Delivery Address</h3>
                      </div>
                      
                      <div className="space-y-4">
                        

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#785427] mb-2">
                              First name <span className="text-[#EB8A14]">*</span>
                            </label>
                            <InputField 
                              handleChange={handleChange} 
                              address={address} 
                              name="firstName" 
                              type="text" 
                              placeholder="First name"
                              icon={User}
                              autocomplete="given-name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#785427] mb-2">
                              Last name <span className="text-[#EB8A14]">*</span>
                            </label>
                            <InputField 
                              handleChange={handleChange} 
                              address={address} 
                              name="lastName" 
                              type="text" 
                              placeholder="Last name"
                              autocomplete="family-name"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-[#785427] mb-2">
                            Street Address <span className="text-[#EB8A14]">*</span>
                          </label>
                          <InputField 
                            handleChange={handleChange} 
                            address={address} 
                            name="street" 
                            type="text" 
                            placeholder="Street address"
                            icon={Home}
                            autocomplete="address-line1"
                          />
                        </div>

                        {/* Apartment */}
                        <div>
                          <label className="block text-sm font-medium text-[#785427] mb-2">
                            Apartment, suite, etc. (optional)
                          </label>
                          <InputField 
                            handleChange={handleChange} 
                            address={address} 
                            name="apartment" 
                            type="text" 
                            placeholder="Apartment, suite, etc."
                            optional={true}
                            autocomplete="address-line2"
                          />
                        </div>

                        {/* City, State, Zipcode */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#785427] mb-2">
                              City <span className="text-[#EB8A14]">*</span>
                            </label>
                            <InputField 
                              handleChange={handleChange} 
                              address={address} 
                              name="city" 
                              type="text" 
                              placeholder="City"
                              autocomplete="address-level2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#785427] mb-2">State</label>
                            <select
                              name="state"
                              value={address.state}
                              onChange={handleChange}
                              autoComplete="address-level1"
                              className="w-full px-3 py-3 border-2 border-[#EB8A14] rounded-xl outline-none text-[#0a6134] bg-white focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 font-medium"
                            >
                              <option value="Punjab">Punjab</option>
                              <option value="Sindh">Sindh</option>
                              <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                              <option value="Balochistan">Balochistan</option>
                              <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                              <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                              <option value="Azad Jammu and Kashmir">Azad Jammu and Kashmir</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#785427] mb-2">
                              ZIP/Postal code <span className="text-[#EB8A14]">*</span>
                            </label>
                            <InputField 
                              handleChange={handleChange} 
                              address={address} 
                              name="zipcode" 
                              type="text" 
                              placeholder="ZIP/Postal code"
                              autocomplete="postal-code"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-[#785427] mb-2">
                            Phone <span className="text-[#EB8A14]">*</span>
                          </label>
                          <InputField 
                            handleChange={handleChange} 
                            address={address} 
                            name="phone" 
                            type="tel" 
                            placeholder="Phone number"
                            icon={Phone}
                            autocomplete="tel"
                          />
                          <p className="text-xs text-[#785427] mt-1 ml-1">Required for delivery updates</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white p-1.5 rounded-lg border-2 border-[#EB8A14]">
                          <Shield className="w-4 h-4 text-[#0a6134]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0a6134]">Payment Method</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {/* COD Option */}
                        <label
                          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 ${
                            address.paymentMethod === "COD"
                              ? "border-[#EB8A14] bg-[#EB8A14]/10"
                              : "border-[#EB8A14] hover:bg-[#EB8A14]/5"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={address.paymentMethod === "COD"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              address.paymentMethod === "COD"
                                ? "border-[#EB8A14] bg-[#EB8A14]"
                                : "border-[#785427]"
                            }`}
                          >
                            {address.paymentMethod === "COD" && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#0a6134] mb-1">Cash on Delivery</p>
                            <p className="text-sm text-[#785427]">Pay when you receive your order</p>
                            <p className="text-xs text-[#EB8A14] mt-1 font-medium">+ 2% COD fee applied</p>
                          </div>
                        </label>

                        {/* Card Option */}
                        <label
                          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 ${
                            address.paymentMethod === "card"
                              ? "border-[#EB8A14] bg-[#EB8A14]/10"
                              : "border-[#EB8A14] hover:bg-[#EB8A14]/5"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={address.paymentMethod === "card"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              address.paymentMethod === "card"
                                ? "border-[#EB8A14] bg-[#EB8A14]"
                                : "border-[#785427]"
                            }`}
                          >
                            {address.paymentMethod === "card" && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#0a6134] mb-1">Online Payment</p>
                            <p className="text-sm text-[#785427]">Pay securely with credit/debit card</p>
                            <p className="text-xs text-green-600 mt-1 font-medium">No extra fees</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#EB8A14] hover:bg-[#da7c09] text-white py-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-2 border-[#EB8A14]"
                    >
                      {address.paymentMethod === "COD" ? "Place Order" : "Proceed to Payment"}
                    </button>

                    {!user && (
                      <p className="text-center mt-4">
                        <span className="inline-flex items-center gap-2 bg-white text-[#EB8A14] px-4 py-2.5 rounded-full border-2 border-[#EB8A14] text-sm font-medium">
                          <Info className="w-4 h-4" />
                          Checking out as guest
                        </span>
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:w-[350px] lg:flex-shrink-0">
              <div className="bg-[#bfd9bde0] rounded-2xl p-1 shadow-xl border-4 border-[#EB8A14] lg:sticky lg:top-24">
                <div className="bg-[#bfd9bde0] rounded-xl p-4 sm:p-6 flex flex-col">
                  <h2 className="text-xl font-bold text-[#0a6134] mb-6 flex items-center gap-3">
                    <div className="bg-[#EB8A14] p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div 
                    className="mb-6 pr-2 custom-scrollbar"
                    style={{
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="space-y-4">
                      {cartArray.map((item, index) => (
                        <div key={index} className="flex gap-3 pb-4 border-b-2 border-[#EB8A14] pt-2">
                          <div className="relative flex-shrink-0 mt-1">
                            <img 
                              src={item.image[0]} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-[#EB8A14]"
                            />
                            <div className="absolute -top-1 -right-1 bg-[#EB8A14] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
                              {item.quantity}
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[#0a6134] text-sm leading-tight">{item.name}</h3>
                                {item.selectedWeight && (
                                  <span className="text-[#785427] text-xs whitespace-nowrap">Weight: {item.selectedWeight}</span>
                                )}
                              </div>
                            </div>
                            <p className="font-bold text-[#96580D] text-sm whitespace-nowrap ml-2">
                              {currency}{(item.displayOfferPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discount Code + Price Summary */}
                  <div className="mt-auto">
                    <div className="mb-6">
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="Discount code" 
                          className="flex-1 px-3 py-2 border-2 border-[#EB8A14] rounded-lg outline-none text-[#0a6134] bg-[#bfd9bde0] focus:border-[#EB8A14] text-sm"
                        />
                        <button className="px-4 py-2 bg-[#bfd9bde0] text-[#0a6134] font-semibold rounded-lg border-2 border-[#EB8A14] hover:bg-[#EB8A14] hover:text-white transition text-sm whitespace-nowrap">
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[#785427]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#0a6134]">{currency}{cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#785427]">
                        <span>Shipping</span>
                        <span className="font-semibold text-[#EB8A14]">{currency}{shippingFee.toFixed(2)}</span>
                      </div>
                      
                      {address.paymentMethod === 'COD' && codFee > 0 && (
                        <div className="flex justify-between items-center text-[#785427]">
                          <span>COD Fee (2%)</span>
                          <span className="font-semibold text-[#EB8A14]">{currency}{codFee.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-lg font-bold text-[#0a6134] mt-4 pt-4 border-t-2 border-[#EB8A14]">
                        <span>Total</span>
                        <span className="text-[#96580D]">{currency}{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAddress;