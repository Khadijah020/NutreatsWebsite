import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from "react-hot-toast";

// Input field component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-3 py-2.5 border border-gray-400 rounded outline-none text-gray-600 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
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
    <div className="mt-16 px-4 sm:px-6 pb-16">
      <p className="text-2xl md:text-3xl text-gray-600">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-8 md:mt-10 gap-6 md:gap-12">
        {/* Form */}
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="firstName" type="text" placeholder="First Name" />
              <InputField handleChange={handleChange} address={address} name="lastName" type="text" placeholder="Last Name" />
            </div>

            <InputField handleChange={handleChange} address={address} name="email" type="email" placeholder="Email Address" />
            <InputField handleChange={handleChange} address={address} name="street" type="text" placeholder="Street" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="city" type="text" placeholder="City" />
              <InputField handleChange={handleChange} address={address} name="state" type="text" placeholder="State" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="zipcode" type="text" placeholder="Zip Code" />
              <InputField handleChange={handleChange} address={address} name="country" type="text" placeholder="Country" />
            </div>

            <InputField handleChange={handleChange} address={address} name="phone" type="text" placeholder="Phone" />

            <button className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition font-semibold uppercase">
              Save Address
            </button>
          </form>
        </div>

        {/* Image */}
        <div className="flex justify-center md:justify-end">
          <img
            src={assets.add_address_iamge}
            alt="add address"
            className="w-full max-w-xs md:max-w-sm object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
