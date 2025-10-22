import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 w-80 sm:w-96 bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-center text-green-600">
          {state === 'login' ? 'User Login' : 'Create Account'}
        </h2>

        {state === 'register' && (
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 outline-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 outline-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 outline-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        <p className="text-sm text-center">
          {state === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setState(state === 'login' ? 'register' : 'login')}
            className="text-green-500 font-medium cursor-pointer"
          >
            {state === 'login' ? 'Sign Up' : 'Login'}
          </span>
        </p>

        <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition">
          {state === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default Login;
