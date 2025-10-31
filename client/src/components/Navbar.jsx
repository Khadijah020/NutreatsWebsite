import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import logo from "../assets/logo.png";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const {
    user,
    setuser,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    getCartCount,
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setuser(null);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) navigate("/products");
  }, [searchQuery]);

  // 🔸 Function to scroll smoothly to the footer (contact section)
  const scrollToFooter = () => {
    const footerSection = document.getElementById("contact-section");
    if (footerSection) {
      footerSection.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false); // close mobile menu if open
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-10 lg:px-16 py-2.5 bg-[#faf7f2] backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
      {/* Logo */}
      <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center">
        <img src={logo} alt="logo" className="w-24 md:w-32 h-auto" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-[15px]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `font-medium transition duration-200 ${
              isActive ? "text-[#AD3A24]" : "text-gray-700 hover:text-[#AD3A24]"}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `font-medium transition duration-200 ${
              isActive ? "text-[#AD3A24]" : "text-gray-700 hover:text-[#AD3A24]"}`
          }
        >
          Products
        </NavLink>

        {/* 🔸 Contact link scrolls to footer */}
        <button
          onClick={scrollToFooter}
          className="font-medium text-gray-700 hover:text-[#AD3A24] transition duration-200"
        >
          Contact
        </button>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 border border-gray-200 rounded-full bg-[#faf7f2] focus-within:ring-1 focus-within:ring-[#AD3A24] transition-all duration-200">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery || ""}
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-28 placeholder-gray-400"
          />
          <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-70" />
        </div>

        {/* Cart */}
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer hover:opacity-80 transition"
        >
          <img src={assets.nav_cart_icon} alt="cart" className="w-5 opacity-80" />
          <span className="absolute -top-2 -right-2 text-[10px] font-medium text-white bg-[#AD3A24] w-4 h-4 flex items-center justify-center rounded-full">
            {getCartCount()}
          </span>
        </div>

        {/* Auth */}
        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="px-4 py-1.5 rounded-full bg-[#AD3A24] text-white text-sm font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        ) : (
          <div className="relative group">
            <img src={assets.profile_icon} className="w-8 cursor-pointer" alt="profile" />
            <ul className="hidden group-hover:block absolute top-8 right-0 bg-white border border-gray-100 shadow-md rounded-md py-1 w-32 text-sm z-50">
              <li
                onClick={() => navigate("my-orders")}
                className="px-3 py-1.5 hover:bg-[#AD3A24] hover:text-white cursor-pointer"
              >
                My Orders
              </li>
              <li
                onClick={logout}
                className="px-3 py-1.5 hover:bg-[#AD3A24] hover:text-white cursor-pointer"
              >
                Log Out
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <div className="flex items-center gap-3 md:hidden">
        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt="cart" className="w-5 opacity-80" />
          <span className="absolute -top-2 -right-2 text-[9px] text-white bg-[#AD3A24] w-[15px] h-[15px] flex items-center justify-center rounded-full">
            {getCartCount()}
          </span>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="focus:outline-none">
          <img src={assets.menu_icon} alt="menu" className="w-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-[58px] left-0 w-full bg-white shadow-md flex flex-col items-start gap-2 px-5 py-3 text-gray-700 font-medium text-sm border-t border-gray-100 md:hidden z-40">
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            Products
          </NavLink>
          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)}>
              My Orders
            </NavLink>
          )}

          {/* 🔸 Mobile “Contact” scrolls down too */}
          <button onClick={scrollToFooter} className="text-left w-full">
            Contact
          </button>

          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="w-full mt-2 bg-[#AD3A24] text-white py-1.5 rounded-full"
            >
              Login
            </button>
          ) : (
            <button onClick={logout} className="w-full mt-2 bg-[#AD3A24] text-white py-1.5 rounded-full">
              Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
