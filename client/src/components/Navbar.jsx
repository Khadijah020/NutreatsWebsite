import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import logo from "../assets/logo.png";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import CartDrawer from "../pages/CartDrawer";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  // Close mobile menu when cart opens
  useEffect(() => {
    if (isCartOpen) {
      setOpen(false);
    }
  }, [isCartOpen]);

  // Scroll to footer
  const scrollToFooter = () => {
    const footerSection = document.getElementById("contact-section");
    if (footerSection) {
      footerSection.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-10 py-2 bg-[#f3efe9] backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
        
        {/* Logo */}
        <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center">
          <img src={logo} alt="logo" className="w-20 md:w-24 h-auto" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-[14px]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition duration-200 ${
                isActive ? "text-[#EB8A14]" : "text-gray-700 hover:text-[#EB8A14]"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `font-medium transition duration-200 ${
                isActive ? "text-[#EB8A14]" : "text-gray-700 hover:text-[#EB8A14]"
              }`
            }
          >
            Products
          </NavLink>

          <button
            onClick={scrollToFooter}
            className="font-medium text-gray-700 hover:text-[#EB8A14] transition duration-200"
          >
            Contact
          </button>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-full bg-[#faf7f2] focus-within:ring-1 focus-within:ring-[#EB8A14] transition-all duration-200">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery || ""}
              type="text"
              placeholder="Search products..."
              className="bg-transparent outline-none text-sm w-48 xl:w-64 placeholder-gray-400"
            />
            <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-70" />
          </div>

          {/* Cart */}
          <div
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer hover:opacity-80 transition"
          >
            <img src={assets.nav_cart_icon} alt="cart" className="w-5 opacity-80" />
            <span className="absolute -top-2 -right-2 text-[10px] font-medium text-white bg-[#EB8A14] w-4 h-4 flex items-center justify-center rounded-full">
              {getCartCount()}
            </span>
          </div>

          {/* Auth */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="px-4 py-1.5 rounded-full bg-[#EB8A14] text-white text-sm font-medium hover:bg-[#96580D] transition whitespace-nowrap"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img src={assets.profile_icon} className="w-7 cursor-pointer" alt="profile" />
              <ul className="hidden group-hover:block absolute top-7 right-0 bg-white border border-gray-100 shadow-md rounded-md py-1 w-32 text-sm z-50">
                <li
                  onClick={() => navigate("my-orders")}
                  className="px-3 py-1.5 hover:bg-[#EB8A14] hover:text-white cursor-pointer"
                >
                  My Orders
                </li>
                <li
                  onClick={logout}
                  className="px-3 py-1.5 hover:bg-[#EB8A14] hover:text-white cursor-pointer"
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex items-center gap-3 md:hidden">
          <div onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt="cart" className="w-5 opacity-80" />
            <span className="absolute -top-2 -right-2 text-[9px] text-white bg-[#EB8A14] w-[15px] h-[15px] flex items-center justify-center rounded-full font-medium">
              {getCartCount()}
            </span>
          </div>

          <button onClick={() => setOpen(!open)} aria-label="Menu">
            <img src={assets.menu_icon} alt="menu" className="w-5" />
          </button>
        </div>
      </nav>

      {/* ---------------- MOBILE DRAWER (ALWAYS MOUNTED) ---------------- */}

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300
        ${open ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ top: "54px" }}
      ></div>

      {/* Drawer */}
      <div
        className={`fixed top-[54px] right-0 w-[75%] max-w-[300px] h-[calc(100vh-54px)]
        bg-[#faf7f2] shadow-2xl flex flex-col gap-1 px-5 py-4 text-gray-700 font-medium text-sm 
        md:hidden z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <NavLink
          to="/"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `py-2.5 px-3 rounded-lg transition-colors ${
              isActive ? "bg-[#EB8A14] text-white" : "hover:bg-[#bfd9bd]/30"
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `py-2.5 px-3 rounded-lg transition-colors ${
              isActive ? "bg-[#EB8A14] text-white" : "hover:bg-[#bfd9bd]/30"
            }`
          }
        >
          Products
        </NavLink>

        {user && (
          <NavLink
            to="/my-orders"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `py-2.5 px-3 rounded-lg transition-colors ${
                isActive ? "bg-[#EB8A14] text-white" : "hover:bg-[#bfd9bd]/30"
              }`
            }
          >
            My Orders
          </NavLink>
        )}

        <button
          onClick={scrollToFooter}
          className="text-left py-2.5 px-3 rounded-lg hover:bg-[#bfd9bd]/30 transition-colors"
        >
          Contact
        </button>

        <div className="border-t border-gray-200 my-3"></div>

        {!user ? (
          <button
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="w-full bg-[#EB8A14] text-white py-2.5 rounded-lg hover:bg-[#96580D] transition font-semibold"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full bg-[#EB8A14] text-white py-2.5 rounded-lg hover:bg-[#96580D] transition font-semibold"
          >
            Log Out
          </button>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;