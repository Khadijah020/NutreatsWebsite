import {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setuser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
  return JSON.parse(localStorage.getItem("guestCart")) || {};
});

  const [searchQuery, setSearchQuery] = useState("");

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  //fetch user auth status, user data and cart items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
    setuser(data.user);
    const guestCart = JSON.parse(localStorage.getItem("guestCart"));
    if (guestCart && Object.keys(guestCart).length > 0) {
        // Merge guestCart into user.cartItems
        const mergedCart = { ...data.user.cartItems, ...guestCart };
        setCartItems(mergedCart);
        await axios.post('/api/cart/update', { cartItems: mergedCart });
        localStorage.removeItem("guestCart");
    } else {
        setCartItems(data.user.cartItems);
    }
}

    } catch (error) {
      setuser(null);
      setCartItems(JSON.parse(localStorage.getItem("guestCart")) || {});
    }
  };

  //add item to cart
  const addToCart = (itemId) => {
  if (!itemId) return; // safety check
  let cartData = { ...cartItems }; // shallow copy is enough
  cartData[itemId] = (cartData[itemId] || 0) + 1;
  setCartItems(cartData);
  toast.success("Added to Cart");
  if (!user) localStorage.setItem("guestCart", JSON.stringify(cartData));
};


  //update cart
  const updateCartItem = (itemId, quantity) => {
  if (!itemId) return;
  let cartData = { ...cartItems };
  cartData[itemId] = quantity;
  setCartItems(cartData);
  if (!user) localStorage.setItem("guestCart", JSON.stringify(cartData));
};

//remove item from cart
const removeFromCart = (itemId) => {
  if (!itemId) return;
  let cartData = { ...cartItems };
  if (cartData[itemId]) {
    cartData[itemId] -= 1;
    if (cartData[itemId] <= 0) delete cartData[itemId];
  }
  setCartItems(cartData);
  if (!user) localStorage.setItem("guestCart", JSON.stringify(cartData));
};


  //fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Get cart item count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  //get cart total amount
const getCartAmount = () => {
  let totalAmount = 0;
  for (const items in cartItems) {
    let itemInfo = products.find((product) => product._id === items);
    // Add safety check to ensure product exists
    if (itemInfo && cartItems[items] > 0) {
      totalAmount += itemInfo.offerPrice * cartItems[items];
    }
  }
  return Math.floor(totalAmount * 100) / 100;
};

  useEffect(() => {
    fetchProducts();
    fetchSeller();
    fetchUser();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const localCart = localStorage.getItem("guestCart");
    if (localCart && !user) {
      setCartItems(JSON.parse(localCart));
    }
  }, [user]);

  // Save cart to localStorage whenever it changes (for guests)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  //updata db cart items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) {
          toast.error(data.message); // ✅ show success notification
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user) {
      updateCart();
    }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setuser,
    setIsSeller,
    isSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    addToCart,
    currency,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
