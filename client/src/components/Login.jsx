import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, X } from 'lucide-react';

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
        <div className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
          
          {/* Inner card */}
          <div className="bg-[#ecd4d0] rounded-2xl p-8 relative">
            {/* Close button */}
            <button
              onClick={() => setShowUserLogin(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-[#AD3A24] transition z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Inner decorative corners */}
            <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-xl pointer-events-none"></div>
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-xl pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/60 rounded-full border-2 border-amber-200/50 mb-4">
                  <User className="w-8 h-8 text-[#AD3A24]" />
                </div>
                <h2 className="text-2xl font-bold text-[#8B2E1A]">
                  {state === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {state === 'login' 
                    ? 'Sign in to your account' 
                    : 'Join us for a great shopping experience'}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {state === 'register' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AD3A24]/60">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 border-amber-200/50 rounded-xl outline-none text-gray-700 bg-white/80 focus:border-[#AD3A24] focus:ring-2 focus:ring-[#AD3A24]/20 transition placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AD3A24]/60">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 border-amber-200/50 rounded-xl outline-none text-gray-700 bg-white/80 focus:border-[#AD3A24] focus:ring-2 focus:ring-[#AD3A24]/20 transition placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AD3A24]/60">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 border-amber-200/50 rounded-xl outline-none text-gray-700 bg-white/80 focus:border-[#AD3A24] focus:ring-2 focus:ring-[#AD3A24]/20 transition placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Toggle between login/signup */}
                <div className="text-center text-sm pt-2">
                  <span className="text-gray-600">
                    {state === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setState(state === 'login' ? 'register' : 'login')}
                    className="text-[#AD3A24] font-semibold hover:text-[#8B2E1A] transition"
                  >
                    {state === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </div>

                {/* Submit button */}
                <button 
                  onClick={onSubmitHandler}
                  className="w-full bg-[#AD3A24] hover:bg-[#8B2E1A] text-white font-semibold py-3 rounded-full transition shadow-md hover:shadow-lg mt-6"
                >
                  {state === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-200/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#ecd4d0] px-3 text-gray-500">
                      Secure & encrypted connection
                    </span>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#AD3A24]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#AD3A24]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
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