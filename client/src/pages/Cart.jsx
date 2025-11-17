import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ShoppingCart, ArrowRight, Plus, Minus, Trash2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";
const Cart = () => {
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
  
  const getCart = () => {
  const tempArray = [];
  const cartMeta = JSON.parse(localStorage.getItem('cartMeta') || '{}');
  
  for (const key in cartItems) {
    if (key.includes('_')) {
      const [productId, weight] = key.split('_');
      const product = products.find((item) => item._id === productId);
      
      if (product) {
        // Find the weight variant from the product's current weights array
        const weightVariant = product.weights?.find(w => w.weight === weight);
        
        if (weightVariant) {
          // Use FRESH prices from product data, not stored prices
          tempArray.push({
            ...product,
            cartKey: key,
            quantity: cartItems[key],
            selectedWeight: weight,
            displayPrice: weightVariant.price,
            displayOfferPrice: weightVariant.offerPrice
          });
        }
      }
    } else {
      const product = products.find((item) => item._id === key);
      if (product) {
        // Use FRESH prices from product data
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

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  const cartSubtotal = cartArray.reduce(
    (sum, item) => sum + item.displayOfferPrice * item.quantity,
    0
  );

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

      <div className="min-h-screen bg-[#f8faf7] mt-16 px-4 sm:px-6 pt-5">
        <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mt-4 mb-4 transition-colors"
>
  <ArrowLeft size={20} />
  Back
</button>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="py-6 max-w-5xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm text-[#785427]">
            <li>
              <a href="/" className="hover:text-[#EB8A14] transition">Home</a>
            </li>
            <li><ChevronRight size={16} /></li>
            <li aria-current="page" className="text-[#EB8A14] font-medium">
              Shopping Cart
            </li>
          </ol>
        </nav>

        <div className="max-w-5xl mx-auto">
          {/* CART ITEMS */}
          <main role="main">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-[#EB8A14] to-[#EB8A14] p-2 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0a6134]">
                Shopping Cart
                <span className="text-base text-[#785427] ml-2 font-normal">
                  ({getCartCount()} item{getCartCount() !== 1 ? 's' : ''})
                </span>
              </h1>
            </div>

            {cartArray.length === 0 ? (
              <div className="group relative bg-[#bfd9bde0] rounded-2xl p-8 shadow-xl text-center border-4 border-[#EB8A14] hover:shadow-2xl transition-all duration-500">
                {/* Decorative corners */}
                <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#EB8A14] rounded-tl-xl" />
                <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#EB8A14] rounded-br-xl" />
                
                <ShoppingCart className="w-20 h-20 text-[#EB8A14]/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-[#0a6134] mb-4">Your cart is empty</h2>
                <p className="text-[#785427] mb-8 max-w-md mx-auto">
                  Discover our premium collection of spices and add some flavor to your cart!
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EB8A14] to-[#EB8A14] hover:from-[#EB8A14] hover:to-[#EB8A14] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#EB8A14]"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              <>
                <section className="space-y-6 mb-8" aria-label="Cart items">
                  {cartArray.map((product, index) => (
                    <article
                      key={index}
                      className="group relative bg-[#bfd9bde0] rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-[#EB8A14]"
                    >
                      {/* Subtle decorative corners */}
                      <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-[#EB8A14] rounded-tl-xl" />
                      <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-[#EB8A14] rounded-br-xl" />
                      
                      <div className="bg-[#c2dfbfe0] rounded-xl p-6 flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <a
                            href={`/${product.category.toLowerCase()}/${product.slug}`}
                            className="block w-24 h-24 sm:w-28 sm:h-28 border-2 border-[#EB8A14] rounded-xl overflow-hidden bg-white hover:scale-105 transition-transform duration-300 group/image"
                            aria-label={`View ${product.name}`}
                          >
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </a>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-4">
                          <div className="flex-1">
                            <h2 className="font-bold text-[#0a6134] text-lg mb-2 hover:text-[#EB8A14] transition-colors">
                              <a href={`/${product.category.toLowerCase()}/${product.slug}`}>
                                {product.name}
                              </a>
                            </h2>
                            
                            {product.selectedWeight && (
                              <p className="text-[#785427] font-bold text-md mb-3">
                                Weight: <span className="text-lg font-bold text-[#EB8A14]">{product.selectedWeight}</span>
                              </p>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              <label className="text-[#785427] font-bold text-md">Quantity:</label>
                              <div className="flex items-center gap-2 bg-[#bfd9bde0] rounded-lg p-1 border-2 border-[#EB8A14]">
                                <button
                                  onClick={() =>
                                    cartItems[product.cartKey] > 1
                                      ? updateCartItem(product.cartKey, cartItems[product.cartKey] - 1)
                                      : removeFromCart(product.cartKey)
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EB8A14]/20 transition-colors text-[#EB8A14] font-bold hover:text-[#EB8A14]"
                                  aria-label={`Decrease quantity of ${product.name}`}
                                >
                                  <Minus size={20} strokeWidth={2.5} />
                                </button>
                                <span 
                                  className="w-8 text-center font-semibold text-[#0a6134] text-md font-bold"
                                  aria-live="polite"
                                >
                                  {cartItems[product.cartKey]}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartItem(product.cartKey, cartItems[product.cartKey] + 1)
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EB8A14]/20 transition-colors text-[#EB8A14] font-bold hover:text-[#EB8A14]"
                                  aria-label={`Increase quantity of ${product.name}`}
                                >
                                  <Plus size={20} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex sm:flex-col justify-between sm:items-end gap-4">
                            <p className="text-xl font-bold text-[#96580D]">
                              {currency}{(product.displayOfferPrice * product.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(product.cartKey)}
                              className="flex items-center gap-1.5 text-[#785427] hover:text-[#EB8A14] font-medium text-sm transition-colors px-3 py-1 rounded-lg hover:bg-[#EB8A14]/20 border border-[#EB8A14]"
                              aria-label={`Remove ${product.name} from cart`}
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                {/* Cart Summary & Checkout */}
                <div className="bg-white rounded-2xl p-1 shadow-xl border-4 border-[#EB8A14]">
                  <div className="bg-white rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      {/* Subtotal */}
                      <div>
                        <p className="text-[#785427] text-sm font-medium mb-1">Cart Subtotal</p>
                        <p className="text-3xl font-bold text-[#96580D]">
                          {currency}{cartSubtotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-[#785427] mt-1">
                          {getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in cart
                        </p>
                      </div>

                      {/* Checkout Button */}
                      <button
                        onClick={() => navigate('/add-address')}
                        className="group flex items-center gap-3 bg-[#EB8A14] hover:bg-[#e9870f] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#EB8A14] whitespace-nowrap"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <a
                  href="/products"
                  className="inline-flex items-center gap-2 text-[#0a6134] hover:text-[#EB8A14] mt-8 font-semibold transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-r from-[#EB8A14] to-[#EB8A14] p-1 rounded-lg group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-4 h-4 rotate-180 text-white" />
                  </div>
                  Continue Shopping
                </a>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  ) : null;
};

export default Cart;