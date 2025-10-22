import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import logo from "../../assets/logo.png";
import { Outlet, NavLink, Link } from "react-router-dom";
import toast from "react-hot-toast";

const SellerLayout = () => {
  const { axios, navigate } = useAppContext();

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {/* ✅ Modern Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-10 lg:px-16 py-3 bg-[#f3efe9] backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-24 md:w-32 h-auto" />
        </Link>

        <div className="flex items-center gap-5 text-gray-700 text-[15px]">
          <p className="hidden sm:block font-medium">Hi Admin!</p>
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ✅ Sidebar + Main Content */}
      <div className="flex bg-[#efeae0] min-h-[calc(100vh-70px)]">
        {/* Sidebar */}
        <div className="md:w-64 w-20 border-r border-gray-200 bg-[#efeae0] text-base pt-4 flex flex-col shadow-sm">
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

        {/* Main Outlet */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;
