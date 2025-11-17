import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, X, Shield, Key } from 'lucide-react';

const Login = () => {
  const [state, setState] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { setShowUserLogin, setuser, axios, navigate } = useAppContext();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(`/api/user/${state}`, { name, email, password });
      if (data.success) {
        toast.success(state === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
        setuser(data.user);
        navigate('/');
        setShowUserLogin(false);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md"
      >
        {/* Outer decorative card */}
        <div className="group relative bg-[#bfd9bde0] rounded-2xl p-1 shadow-2xl border border-[#F2B469]/20 hover:shadow-3xl transition-all duration-500">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#EB8A14]/30 rounded-tl-xl"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#EB8A14]/30 rounded-br-xl"></div>
          
          {/* Inner card */}
          <div className="bg-white/50 rounded-xl p-6 sm:p-8 relative">
            {/* Close button */}
            <button
              onClick={() => setShowUserLogin(false)}
              className="absolute top-4 right-4 text-[#785427] hover:text-[#EB8A14] transition z-10 hover:scale-110"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Inner decorative corners */}
            <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#F2B469]/30 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#F2B469]/30 rounded-bl-lg pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#EB8A14] to-[#F2B469] rounded-full border-2 border-[#F2B469]/30 mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#0a6134]">
                  {state === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-[#0a6134] text-sm mt-1">
                  {state === 'login' 
                    ? 'Sign in to your account' 
                    : 'Join us for a great shopping experience'}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {state === 'register' && (
                  <div>
                    <label className="text-sm font-semibold text-[#0a6134] block mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EB8A14]">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 border-[#F2B469]/30 rounded-xl outline-none text-[#0a6134] bg-white/80 focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-[#785427]/60 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-[#0a6134] block mb-1.5">
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
                      className="w-full pl-10 pr-3 py-3 border-2 border-[#F2B469]/30 rounded-xl outline-none text-[#0a6134] bg-white/80 focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-[#785427]/60 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#0a6134] block mb-1.5">
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
                      className="w-full pl-10 pr-3 py-3 border-2 border-[#F2B469]/30 rounded-xl outline-none text-[#0a6134] bg-white/80 focus:border-[#EB8A14] focus:ring-2 focus:ring-[#EB8A14]/20 transition placeholder-[#785427]/60 font-medium"
                    />
                  </div>
                </div>

                {/* Toggle between login/signup */}
                <div className="text-center text-sm pt-2">
                  <span className="text-[#785427]">
                    {state === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setState(state === 'login' ? 'register' : 'login')}
                    className="text-[#EB8A14] font-semibold hover:text-[#96580D] transition hover:underline"
                  >
                    {state === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </div>

                {/* Submit button */}
                <button 
                  onClick={onSubmitHandler}
                  className="w-full bg-[#EB8A14] hover:bg-[#EB8A14] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#F2B469]/30"
                >
                  {state === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#F2B469]/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 text-xs text-[#785427]">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#bfd9bd] p-1 rounded">
                      <Shield className="w-3 h-3 text-[#0a6134]" />
                    </div>
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-[#F2B469] rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#bfd9bd] p-1 rounded">
                      <Key className="w-3 h-3 text-[#0a6134]" />
                    </div>
                    <span>Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;