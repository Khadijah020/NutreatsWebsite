import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import logo from "../../assets/logo.png";
import { Outlet, NavLink, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { Menu, Users, Package, ShoppingCart, FileText, PlusCircle, Grid, LayoutDashboard, BarChart3 } from "lucide-react";

const SellerLayout = () => {
  const { axios, navigate } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
    { name: "Customers", path: "/seller/customers", icon: Users },
    { name: "Add Product", path: "/seller/add-product", icon: PlusCircle },
    { name: "Manage Categories", path: "/seller/category", icon: Grid },
    { name: "Product List", path: "/seller/product-list", icon: Package },
    { name: "Orders", path: "/seller/orders", icon: ShoppingCart },
    { name: "Create Bill", path: "/seller/create-bill", icon: FileText },
    { name: "Reports", path: "/seller/reports", icon: BarChart3 },
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
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-10 lg:px-16 py-3 bg-[#bfd9bde0] border-b border-gray-300 shadow-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-24 md:w-32 h-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-white/60 transition text-gray-700"
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <Menu size={20} />
          </button>

          {/* Greeting */}
          <p className="hidden sm:block font-medium text-gray-700">Hi Admin!</p>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-full bg-[#EB8A14] text-white text-sm font-semibold hover:bg-orange-600 transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Main */}
      <div className="flex bg-[#bfd9bde0] min-h-[calc(100vh-70px)] overflow-x-hidden">
        {/* Sidebar for large screens */}
        <div className="hidden sm:flex md:w-64 w-64 border-r border-gray-300 bg-[#bfd9bde0] flex-col pt-4 shadow-sm">
          {sidebarLinks.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 gap-3 rounded-r-full mx-2 my-1 transition-all ${
                    isActive
                      ? "bg-[#EB8A14] text-white font-medium shadow-md"
                      : "hover:bg-white text-gray-700"
                  }`
                }
              >
                <IconComponent size={20} className="opacity-80" />
                <p className="md:block hidden">{item.name}</p>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar for mobile/tablet */}
        <div
          className={`
            fixed top-0 left-0 z-50 h-full bg-white/95 border-r border-gray-300 flex flex-col pt-4 shadow-lg
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            sm:hidden w-56
          `}
        >
          {sidebarLinks.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 gap-3 rounded-r-full mx-2 my-1 transition-all ${
                    isActive
                      ? "bg-[#EB8A14] text-white font-medium shadow-md"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <IconComponent size={20} className="opacity-80" />
                <p>{item.name}</p>
              </NavLink>
            );
          })}
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-6 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;