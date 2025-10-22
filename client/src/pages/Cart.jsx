import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const [showAddress, setShowAddress] = useState(false);
  const {
    products,
    setCartItems,
    user,
    axios,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState();
  const [paymentOption, setPaymentOption] = useState("COD");

  const getCart = () => {
  const tempArray = [];
  for (const key in cartItems) {
    const product = products.find((item) => item._id === key);
    // Only add if product exists
    if (product) {
      product.quantity = cartItems[key];
      tempArray.push(product);
    }
  }
  setCartArray(tempArray);
};

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const placeOrder = async () => {
    try {
      if (!selectedAddress) return toast.error("Please select an address");

      const items = cartArray.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      if (!user) {
        const { data } = await axios.post("/api/order/cod", {
          items,
          address: selectedAddress,
        });

        if (data.success) {
          toast.success("Order placed successfully");
          setCartItems({});
          localStorage.removeItem("guestAddress");
        } else {
          toast.error(data.message);
        }
        return;
      }

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", {
          userId: user._id,
          items,
          address: selectedAddress._id,
        });
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      const savedAddress = localStorage.getItem("guestAddress");
      if (savedAddress) {
        const parsed = JSON.parse(savedAddress);
        setAddresses([parsed]);
        setSelectedAddress(parsed);
      }
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  return products.length > 0 && cartItems ? (
    <div className="min-h-screen bg-[#e6dbcee0] mt-16 px-4 sm:px-6 pb-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: CART ITEMS */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-5 text-[#2d2d2d]">
            Shopping Cart{" "}
            <span className="text-sm text-[#3b7d34]">
              ({getCartCount()} items)
            </span>
          </h1>

          {/* Product list */}
          <div className="space-y-4">
            {cartArray.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition"
              >
                {/* Product info */}
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div
                    onClick={() => {
                      navigate(
                        `/products/${product.category.toLowerCase()}/${product._id}`
                      );
                      scrollTo(0, 0);
                    }}
                    className="cursor-pointer w-20 h-20 sm:w-24 sm:h-24 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-white"
                  >
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">
                      {product.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Weight: {product.weight || "N/A"}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                      <p className="font-medium">Qty:</p>
                      <div className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-md select-none">
                        <button
                          onClick={() =>
                            cartItems[product._id] > 1
                              ? updateCartItem(
                                  product._id,
                                  cartItems[product._id] - 1
                                )
                              : removeFromCart(product._id)
                          }
                          className="cursor-pointer text-lg font-medium px-2 h-7 hover:bg-green-200 rounded-l transition"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-gray-800">
                          {cartItems[product._id]}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItem(
                              product._id,
                              cartItems[product._id] + 1
                            )
                          }
                          className="cursor-pointer text-lg font-medium px-2 h-7 hover:bg-green-200 rounded-r transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtotal & Remove */}
                <div className="flex sm:flex-col justify-between sm:justify-center items-center w-full sm:w-auto text-sm sm:text-base">
                  <p className="font-medium text-gray-800">
                    {currency}
                    {product.offerPrice * product.quantity}
                  </p>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-red-600 hover:text-red-700 mt-2 sm:mt-3"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              navigate("/products");
              scrollTo(0, 0);
            }}
            className="flex items-center gap-2 text-[#3b7d34] mt-6 font-medium hover:underline text-sm sm:text-base"
          >
            <img
              src={assets.arrow_right_icon_colored}
              alt="arrow"
              className="w-4 h-4"
            />
            Continue Shopping
          </button>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:w-[360px] w-full h-fit bg-white border border-gray-200 rounded-2xl shadow-md p-5 self-start">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Order Summary
          </h2>
          <hr className="border-gray-300 my-4" />

          {/* Address */}
          <div>
            <p className="text-sm font-semibold uppercase text-gray-700">
              Delivery Address
            </p>
            <div className="relative flex justify-between items-start mt-2">
              <p className="text-gray-600 text-sm pr-3 leading-snug">
                {selectedAddress
                  ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "No address found. Please add one."}
              </p>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-[#f57c00] hover:underline text-xs sm:text-sm font-medium"
              >
                Change
              </button>

              {showAddress && (
                <div className="absolute top-10 left-0 z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg text-sm overflow-hidden">
                  {addresses.map((address, index) => (
                    <p
                      key={index}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className="text-gray-700 p-2 hover:bg-[#faf7f2] cursor-pointer"
                    >
                      {address.street}, {address.city}, {address.state}
                    </p>
                  ))}
                  <p
                    onClick={() => navigate("/add-address")}
                    className="text-[#3b7d34] font-medium text-center cursor-pointer py-2 hover:bg-[#ecf7ed]"
                  >
                    + Add New Address
                  </p>
                </div>
              )}
            </div>

            {/* Payment */}
            <p className="text-sm font-semibold uppercase text-gray-700 mt-6">
              Payment Method
            </p>
            <select
              onChange={(e) => setPaymentOption(e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 rounded-md outline-none focus:ring-2 focus:ring-[#3b7d34]/40 text-sm"
            >
              <option value="COD">Cash On Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          <hr className="border-gray-300 my-4" />

          {/* Price Summary */}
          <div className="text-gray-700 space-y-2 text-sm sm:text-base">
            <p className="flex justify-between">
              <span>Price</span>
              <span>
                {currency}
                {getCartAmount()}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </p>
            <p className="flex justify-between text-base font-semibold text-gray-800 mt-3">
              <span>Total</span>
              <span>
                {currency}
                {(getCartAmount() + getCartAmount() * 0.02).toFixed(2)}
              </span>
            </p>
          </div>

          <button
            onClick={placeOrder}
            className="w-full py-3 mt-6 rounded-lg bg-[#3b7d34] hover:bg-[#2d662c] text-white font-medium text-sm sm:text-base transition"
          >
            {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Cart;
