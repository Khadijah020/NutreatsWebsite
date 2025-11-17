import React from 'react';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OrderSuccess = () => {
  const { navigate } = useAppContext();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-[#EB8A14] text-center">
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
          
          <p className="text-sm text-gray-500 mb-8">
            We'll send you a confirmation email with your order details shortly.
          </p>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="bg-[#bfd9bde0] p-3 rounded-lg mb-2 inline-block">
                <Package className="w-6 h-6 text-[#EB8A14]" />
              </div>
              <p className="text-xs text-gray-600">Order Confirmed</p>
            </div>
            <div className="text-center">
              <div className="bg-[#bfd9bde0] p-3 rounded-lg mb-2 inline-block">
                <ShoppingBag className="w-6 h-6 text-[#EB8A14]" />
              </div>
              <p className="text-xs text-gray-600">Being Prepared</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#bfd9bde0] border-2 border-[#EB8A14] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#0a6134] font-medium">
              📦 Your order will be delivered within 3-5 business days
            </p>
          </div>

          {/* Continue Shopping Button */}
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gradient-to-r from-[#EB8A14] to-[#96580D] hover:from-[#96580D] hover:to-[#EB8A14] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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