import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import axios from "axios";
import { Lock, Mail, Shield } from 'lucide-react';

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/seller/login', { email, password });

      if (data.success) {
        toast.success('Welcome back!');
        setIsSeller(true);
        navigate('/seller');
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
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  return !isSeller && (
    <div className="min-h-screen flex items-center justify-center bg-[#bfd9bde0] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Outer decorative card */}
        <div className="group relative bg-white rounded-2xl p-1 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#EB8A14]/30 rounded-tl-xl"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#EB8A14]/30 rounded-br-xl"></div>
          
          {/* Inner card */}
          <div className="bg-gray-50 rounded-xl p-8 relative">
            {/* Inner decorative corners */}
            <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#EB8A14]/20 rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#EB8A14]/20 rounded-bl-lg"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bfd9bde0] rounded-full border-2 border-[#EB8A14]/30 mb-4">
                  <Shield className="w-8 h-8 text-[#EB8A14]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Seller Portal
                </h2>
                <p className="text-gray-600 text-sm">
                  Sign in to manage your store
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmitHandler} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl outline-none text-gray-700 bg-white focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-gray-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl outline-none text-gray-700 bg-white focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-gray-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EB8A14] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 border-2 border-[#EB8A14]/30"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-gray-50 px-3 text-gray-500">
                      Secure admin access
                    </span>
                  </div>
                </div>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#bfd9bde0] p-1 rounded">
                      <svg className="w-3 h-3 text-[#EB8A14]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Encrypted</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#bfd9bde0] p-1 rounded">
                      <svg className="w-3 h-3 text-[#EB8A14]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Protected</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;