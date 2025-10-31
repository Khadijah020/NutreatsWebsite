import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ShoppingCart, MapPin, CreditCard, Shield, Truck } from "lucide-react";

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
    const cartMeta = JSON.parse(localStorage.getItem('cartMeta') || '{}');
    
    for (const key in cartItems) {
      if (key.includes('_')) {
        const [productId, weight] = key.split('_');
        const product = products.find((item) => item._id === productId);
        
        if (product && cartMeta[key]) {
          const weightData = cartMeta[key];
          tempArray.push({
            ...product,
            cartKey: key,
            quantity: cartItems[key],
            selectedWeight: weight,
            displayPrice: weightData.price,
            displayOfferPrice: weightData.offerPrice
          });
        }
      } else {
        const product = products.find((item) => item._id === key);
        if (product) {
          tempArray.push({
            ...product,
            cartKey: key,
            quantity: cartItems[key],
            selectedWeight: null,
            displayPrice: product.price,
            displayOfferPrice: product.offerPrice
          });
        }
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
        weight: item.selectedWeight || null,
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
          localStorage.removeItem("cartMeta");
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
          localStorage.removeItem("cartMeta");
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

  const cartSubtotal = cartArray.reduce(
    (sum, item) => sum + item.displayOfferPrice * item.quantity,
    0
  );
  const cartTotal = (cartSubtotal * 1.02).toFixed(2);

  const cartStructuredData = {
    "@context": "https://schema.org",
    "@type": "ShoppingCart",
    "name": "NuTreats Shopping Cart",
    "numberOfItems": getCartCount(),
    "itemListElement": cartArray.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "image": item.image[0],
        "offers": {
          "@type": "Offer",
          "price": item.displayOfferPrice,
          "priceCurrency": "PKR",
          "availability": item.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };

  return products.length > 0 && cartItems ? (
    <>
      <SEO
        title={`Shopping Cart (${getCartCount()} items) | NuTreats - Premium Pakistani Spices`}
        description={`Review your ${getCartCount()} item${getCartCount() !== 1 ? 's' : ''} and proceed to checkout. Free delivery in Lahore on orders over Rs. 1500.`}
        keywords="shopping cart, checkout, Pakistani spices, buy spices online, cart review"
        url="https://nutreats.pk/cart"
        canonicalUrl="https://nutreats.pk/cart"
        noindex={true}
        nofollow={true}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(cartStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://nutreats.pk"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Cart",
                "item": "https://nutreats.pk/cart"
              }
            ]
          })}
        </script>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#faf7f2] mt-16 px-4 sm:px-6 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="py-4 max-w-7xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-[#AD3A24] transition">Home</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li aria-current="page" className="text-[#AD3A24] font-medium">
              Shopping Cart
            </li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* LEFT: CART ITEMS */}
          <main className="flex-1" role="main">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-7 h-7 text-[#AD3A24]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#8B2E1A]">
                Shopping Cart
                <span className="text-base text-gray-600 ml-2 font-normal">
                  ({getCartCount()} item{getCartCount() !== 1 ? 's' : ''})
                </span>
              </h1>
            </div>

            {cartArray.length === 0 ? (
              <div className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border border-amber-200/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
                
                <div className="bg-[#ecd4d0] rounded-2xl p-8 text-center relative">
                  <div className="absolute top-2 right-2 w-10 h-10 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                  <div className="absolute bottom-2 left-2 w-10 h-10 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                  
                  <ShoppingCart className="w-16 h-16 text-[#AD3A24]/30 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-[#8B2E1A] mb-3">Your cart is empty</h2>
                  <p className="text-gray-600 mb-6">Add some delicious products to get started!</p>
                  <a
                    href="/products"
                    className="inline-block bg-[#AD3A24] hover:bg-[#8B2E1A] text-white font-medium px-6 py-3 rounded-full transition shadow-md"
                  >
                    Start Shopping
                  </a>
                </div>
              </div>
            ) : (
              <>
                <section className="space-y-4" aria-label="Cart items">
                  {cartArray.map((product, index) => (
                    <article
                      key={index}
                      className="bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-2xl p-1 border border-amber-200/20 relative overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="bg-[#ecd4d0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                          <a
                            href={`/${product.category.toLowerCase()}/${product.slug}`}
                            className="cursor-pointer w-20 h-20 sm:w-24 sm:h-24 border border-amber-200/50 rounded-xl overflow-hidden flex items-center justify-center bg-white/80 hover:scale-105 transition"
                            aria-label={`View ${product.name}`}
                          >
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          </a>
                          <div className="flex flex-col justify-between">
                            <h2 className="font-semibold text-[#8B2E1A] text-base sm:text-lg">
                              {product.name}
                            </h2>
                            {product.selectedWeight && (
                              <p className="text-gray-600 text-sm">
                                Weight: <span className="font-medium">{product.selectedWeight}</span>
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                              <label htmlFor={`qty-${product.cartKey}`} className="font-medium">Qty:</label>
                              <div className="flex items-center gap-0 bg-white border-2 border-amber-200/50 rounded-lg select-none overflow-hidden">
                                <button
                                  onClick={() =>
                                    cartItems[product.cartKey] > 1
                                      ? updateCartItem(product.cartKey, cartItems[product.cartKey] - 1)
                                      : removeFromCart(product.cartKey)
                                  }
                                  className="cursor-pointer text-lg font-medium px-3 h-8 hover:bg-amber-100 transition text-[#AD3A24]"
                                  aria-label={`Decrease quantity of ${product.name}`}
                                >
                                  −
                                </button>
                                <span 
                                  id={`qty-${product.cartKey}`}
                                  className="w-8 text-center text-sm font-semibold text-gray-800 border-x-2 border-amber-200/50 h-8 flex items-center justify-center"
                                  aria-live="polite"
                                >
                                  {cartItems[product.cartKey]}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartItem(product.cartKey, cartItems[product.cartKey] + 1)
                                  }
                                  className="cursor-pointer text-lg font-medium px-3 h-8 hover:bg-amber-100 transition text-[#AD3A24]"
                                  aria-label={`Increase quantity of ${product.name}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between sm:justify-center items-center w-full sm:w-auto text-sm sm:text-base">
                          <p className="font-bold text-[#AD3A24] text-lg">
                            {currency}{product.displayOfferPrice * product.quantity}
                          </p>
                          <button
                            onClick={() => removeFromCart(product.cartKey)}
                            className="text-red-600 hover:text-red-700 mt-0 sm:mt-3 font-medium text-sm"
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                <a
                  href="/products"
                  className="flex items-center gap-2 text-[#AD3A24] mt-6 font-medium hover:text-[#8B2E1A] transition text-sm sm:text-base"
                >
                  ← Continue Shopping
                </a>
              </>
            )}
          </main>

          {/* RIGHT: ORDER SUMMARY */}
          {cartArray.length > 0 && (
            <aside className="lg:w-[380px] w-full h-fit bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] rounded-3xl p-1.5 border border-amber-200/30 self-start relative overflow-hidden" role="complementary" aria-label="Order summary">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
              
              <div className="bg-[#ecd4d0] rounded-2xl p-5 relative">
                <div className="absolute top-2 right-2 w-10 h-10 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                <div className="absolute bottom-2 left-2 w-10 h-10 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                
                <h2 className="text-xl font-bold text-[#8B2E1A] mb-4">
                  Order Summary
                </h2>

                {/* Address */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#AD3A24]" />
                    <h3 className="text-sm font-semibold uppercase text-gray-700">
                      Delivery Address
                    </h3>
                  </div>
                  <div className="relative flex justify-between items-start bg-white/60 rounded-lg p-3 border border-amber-200/50">
                    <address className="text-gray-700 text-sm pr-3 leading-snug not-italic">
                      {selectedAddress
                        ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`
                        : "No address found. Please add one."}
                    </address>
                    <button
                      onClick={() => setShowAddress(!showAddress)}
                      className="text-[#AD3A24] hover:text-[#8B2E1A] text-xs sm:text-sm font-semibold whitespace-nowrap"
                      aria-expanded={showAddress}
                    >
                      Change
                    </button>

                    {showAddress && (
                      <div 
                        className="absolute top-full left-0 mt-2 z-10 w-full bg-white border-2 border-amber-200/50 rounded-xl shadow-lg text-sm overflow-hidden"
                      >
                        {addresses.map((address, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedAddress(address);
                              setShowAddress(false);
                            }}
                            className="text-gray-700 p-3 hover:bg-amber-50 cursor-pointer w-full text-left border-b border-amber-100 last:border-0"
                          >
                            {address.street}, {address.city}, {address.state}
                          </button>
                        ))}
                        <a
                          href="/add-address"
                          className="text-[#AD3A24] font-semibold text-center cursor-pointer py-3 hover:bg-amber-50 block"
                        >
                          + Add New Address
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-[#AD3A24]" />
                    <h3 className="text-sm font-semibold uppercase text-gray-700">
                      Payment Method
                    </h3>
                  </div>
                  <select
                    onChange={(e) => setPaymentOption(e.target.value)}
                    value={paymentOption}
                    className="w-full border-2 border-amber-200/50 bg-white/80 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#AD3A24]/40 text-sm font-medium text-gray-700"
                  >
                    <option value="COD">Cash On Delivery</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>

                <hr className="border-amber-200/50 my-4" />

                {/* Price Summary */}
                <div className="text-gray-700 space-y-2 text-sm sm:text-base mb-5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">{currency}{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-[#AD3A24] font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#8B2E1A] mt-3 pt-3 border-t-2 border-amber-200/50">
                    <span>Total</span>
                    <span>{currency}{cartTotal}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={!selectedAddress}
                  className="w-full py-3 rounded-full bg-[#AD3A24] hover:bg-[#8B2E1A] text-white font-semibold text-sm sm:text-base transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-amber-200/50 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="w-5 h-5 text-[#AD3A24] mb-1" />
                    <span className="text-xs text-gray-600">Secure</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Truck className="w-5 h-5 text-[#AD3A24] mb-1" />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <CreditCard className="w-5 h-5 text-[#AD3A24] mb-1" />
                    <span className="text-xs text-gray-600">Easy Pay</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  ) : null;
};

export default Cart;