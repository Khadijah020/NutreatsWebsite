import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import logo from "../../assets/logo.png";
import { Outlet, NavLink, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { Menu } from "lucide-react";

const SellerLayout = () => {
  const { axios, navigate } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "Create Bill", path: "/seller/create-bill", icon: assets.add_icon },
    { name: "Manage Categories", path: "/seller/category", icon: assets.product_list_icon },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {/* ✅ Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-10 lg:px-16 py-3 bg-[#f3efe9] backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-24 md:w-32 h-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <Menu size={20} />
          </button>

          {/* Greeting */}
          <p className="hidden sm:block font-medium text-gray-700">Hi Admin!</p>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ✅ Sidebar + Main */}
      <div className="flex bg-[#e6dbcee0] min-h-[calc(100vh-70px)]">
        {/* Sidebar for large screens */}
        <div className="hidden sm:flex md:w-64 w-64 border-r border-gray-200 bg-[#e6dbcee0] flex-col pt-4 shadow-sm">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 rounded-r-full mx-2 my-1 transition-all ${
                  isActive
                    ? "bg-green-600 text-white font-medium"
                    : "hover:bg-gray-100 text-gray-600"
                }`
              }
            >
              <img src={item.icon} alt="" className="w-6 h-6 opacity-80" />
              <p className="md:block hidden">{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* Sidebar for mobile/tablet */}
        <div
          className={`
            fixed top-0 left-0 z-50 h-full bg-[#e6dbcee0] border-r border-gray-200 flex flex-col pt-4 shadow-lg
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            sm:hidden w-56
          `}
        >
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 rounded-r-full mx-2 my-1 transition-all ${
                  isActive
                    ? "bg-green-600 text-white font-medium"
                    : "hover:bg-gray-100 text-gray-600"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <img src={item.icon} alt="" className="w-6 h-6 opacity-80" />
              <p>{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;