import React, { useEffect, useState } from 'react';
import { CheckCircle, ShoppingBag, Package, MapPin, Phone, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OrderSuccess = () => {
  const { navigate, currency } = useAppContext();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from localStorage (set before navigation)
    const details = localStorage.getItem('lastOrderDetails');
    if (details) {
      setOrderDetails(JSON.parse(details));
      // Don't remove immediately, keep it for page refresh
    }

    // Cleanup when leaving the page
    return () => {
      // Clear order details when component unmounts
      localStorage.removeItem('lastOrderDetails');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#e6dbcee0] flex items-center justify-center px-4 py-8 md:py-20">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-[#bfd9bde0] rounded-2xl p-8 shadow-xl border-4 border-[#EB8A14] text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-20 h-20 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-[#0a6134] mb-3">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-2">
            Thank you for your order!
          </p>
          
          

         

          {/* Info Box */}
          <div className="bg-[#e2c4a0] border-2 border-[#EB8A14] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#0a6134] font-semibold">
              📦 Your order will be delivered within 3-5 business days
            </p>
          </div>

          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-lg font-bold text-[#0a6134] mb-4 text-center">Order Summary</h3>
              
              {/* Delivery Address */}
              {orderDetails.address && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#EB8A14] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Delivery Address</p>
                      <p className="text-sm text-gray-600">
                        {orderDetails.address.firstName} {orderDetails.address.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {orderDetails.address.street}
                        {orderDetails.address.apartment && `, ${orderDetails.address.apartment}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.zipcode}
                      </p>
                    </div>
                  </div>
                  {orderDetails.address.phone && (
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-[#EB8A14]" />
                      <p className="text-sm text-gray-600">{orderDetails.address.phone}</p>
                    </div>
                  )}
                  {orderDetails.address.email && (
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-[#EB8A14]" />
                      <p className="text-sm text-gray-600">{orderDetails.address.email}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-gray-800 mb-2">Items Ordered</p>
                  <div className="space-y-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start text-sm bg-white p-2 rounded">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item.name}</p>
                          {item.selectedWeight && (
                            <p className="text-gray-500 text-xs">Weight: {item.selectedWeight}</p>
                          )}
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {currency}{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Total */}
              {orderDetails.total && (
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">{currency}{orderDetails.subtotal || orderDetails.total}</span>
                  </div>
                  {orderDetails.shippingFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-800">{currency}{orderDetails.shippingFee}</span>
                    </div>
                  )}
                  {orderDetails.codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Fee</span>
                      <span className="text-gray-800">{currency}{orderDetails.codFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                    <span className="text-[#0a6134]">Total</span>
                    <span className="text-[#0a6134]">{currency}{orderDetails.total}</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {orderDetails.paymentMethod && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Payment:</span> {orderDetails.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Continue Shopping Button */}
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-[#EB8A14] hover:bg-[#e28717] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Continue Shopping
          </button>

          {/* Home Link */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 text-[#0a6134] hover:text-[#EB8A14] font-semibold py-2 transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Need help? Contact us at support@nutreats.pk
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;