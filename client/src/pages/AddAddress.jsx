import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from "react-hot-toast";
import { ChevronRight, MapPin, User, Mail, Phone, Home } from 'lucide-react';

const InputField = ({ type, placeholder, name, handleChange, address, icon: Icon }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AD3A24]/60">
        <Icon size={18} />
      </div>
    )}
    <input
      className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-2 border-amber-200/50 rounded-xl outline-none text-gray-700 bg-white/80 focus:border-[#AD3A24] focus:ring-2 focus:ring-[#AD3A24]/20 transition placeholder-gray-400`}
      type={type}
      placeholder={placeholder}
      onChange={handleChange}
      name={name}
      value={address[name]}
      required
    />
  </div>
);

const AddAddress = () => {
  const { axios, user, navigate } = useAppContext();
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        const { data } = await axios.post("/api/address/add", address);
        if (data.success) {
          toast.success(data.message);
          navigate("/cart");
        } else {
          toast.error(data.message);
        }
      } else {
        localStorage.setItem("guestAddress", JSON.stringify(address));
        toast.success("Address saved for this session");
        navigate("/cart");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      toast("You're checking out as guest");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-[#AD3A24] transition">Home</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li>
              <a href="/cart" className="hover:text-[#AD3A24] transition">Cart</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li aria-current="page" className="text-[#AD3A24] font-medium">
              Add Address
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-8 h-8 text-[#AD3A24]" />
          <h1 className="text-3xl font-bold text-[#8B2E1A]">
            Add Shipping Address
          </h1>
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-between gap-8">
          {/* Form Card */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
              
              <div className="bg-[#ecd4d0] rounded-2xl p-6 sm:p-8 relative">
                {/* Inner decorative corners */}
                <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                
                <form onSubmit={onSubmitHandler} className="space-y-4 relative z-10">
                  {/* Personal Information Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-[#AD3A24]" />
                      <h3 className="text-lg font-semibold text-[#8B2E1A]">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField 
                        handleChange={handleChange} 
                        address={address} 
                        name="firstName" 
                        type="text" 
                        placeholder="First Name"
                        icon={User}
                      />
                      <InputField 
                        handleChange={handleChange} 
                        address={address} 
                        name="lastName" 
                        type="text" 
                        placeholder="Last Name"
                        icon={User}
                      />
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-[#AD3A24]" />
                      <h3 className="text-lg font-semibold text-[#8B2E1A]">Contact Details</h3>
                    </div>
                    <div className="space-y-4">
                      <InputField 
                        handleChange={handleChange} 
                        address={address} 
                        name="email" 
                        type="email" 
                        placeholder="Email Address"
                        icon={Mail}
                      />
                      <InputField 
                        handleChange={handleChange} 
                        address={address} 
                        name="phone" 
                        type="text" 
                        placeholder="Phone Number"
                        icon={Phone}
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Home className="w-5 h-5 text-[#AD3A24]" />
                      <h3 className="text-lg font-semibold text-[#8B2E1A]">Delivery Address</h3>
                    </div>
                    <div className="space-y-4">
                      <InputField 
                        handleChange={handleChange} 
                        address={address} 
                        name="street" 
                        type="text" 
                        placeholder="Street Address"
                        icon={Home}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                          handleChange={handleChange} 
                          address={address} 
                          name="city" 
                          type="text" 
                          placeholder="City"
                        />
                        <InputField 
                          handleChange={handleChange} 
                          address={address} 
                          name="state" 
                          type="text" 
                          placeholder="State/Province"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                          handleChange={handleChange} 
                          address={address} 
                          name="zipcode" 
                          type="text" 
                          placeholder="Zip/Postal Code"
                        />
                        <InputField 
                          handleChange={handleChange} 
                          address={address} 
                          name="country" 
                          type="text" 
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-6 bg-[#AD3A24] hover:bg-[#8B2E1A] text-white py-3.5 rounded-full transition font-semibold text-lg shadow-md hover:shadow-lg"
                  >
                    Save Address & Continue
                  </button>

                  {!user && (
                    <p className="text-center text-sm text-gray-600 mt-4">
                      <span className="inline-flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-full border border-amber-200">
                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Checking out as guest
                      </span>
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="lg:w-[400px] flex items-center justify-center">
            <div className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border-2 border-amber-200/20 relative overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
              
              <div className="bg-[#ecd4d0] rounded-2xl p-8 relative flex items-center justify-center">
                <img
                  src={assets.add_address_iamge}
                  alt="Add shipping address"
                  className="w-full max-w-sm object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;