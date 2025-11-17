import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { X, ShoppingCart, ArrowRight, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);

  const getCart = () => {
    const tempArray = [];
    const cartMeta = JSON.parse(localStorage.getItem("cartMeta") || "{}");

    for (const key in cartItems) {
      if (key.includes("_")) {
        const [productId, weight] = key.split("_");
        const product = products.find((item) => item._id === productId);

        if (product) {
          const weightVariant = product.weights?.find((w) => w.weight === weight);

          if (weightVariant) {
            tempArray.push({
              ...product,
              cartKey: key,
              quantity: cartItems[key],
              selectedWeight: weight,
              displayPrice: weightVariant.price,
              displayOfferPrice: weightVariant.offerPrice,
            });
          }
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
            displayOfferPrice: product.offerPrice,
          });
        }
      }
    }
    setCartArray(tempArray);
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const cartSubtotal = cartArray.reduce(
    (sum, item) => sum + item.displayOfferPrice * item.quantity,
    0
  );

  const handleCheckout = () => {
    onClose();
    navigate("/add-address");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[480px] sm:w-[420px] md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-[#EB8A14] px-6 py-4 flex items-center justify-between border-b-4 border-[#EB8A14]">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
                <p className="text-sm text-white/80">
                  {getCartCount()} item{getCartCount() !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f8faf7]">
            {cartArray.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-[#bfd9bde0] p-6 rounded-full mb-4">
                  <ShoppingBag className="w-16 h-16 text-[#EB8A14]" />
                </div>
                <h3 className="text-xl font-bold text-[#0a6134] mb-2">Your cart is empty</h3>
                <p className="text-[#785427] mb-6">Start adding items to your cart!</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/products");
                  }}
                  className="bg-gradient-to-r from-[#EB8A14] to-[#96580D] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartArray.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-md border-2 border-[#EB8A14] hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-[#EB8A14]"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0a6134] text-sm mb-1 truncate">
                          {product.name}
                        </h3>

                        {product.selectedWeight && (
                          <p className="text-xs text-[#785427] mb-2">
                            Weight:{" "}
                            <span className="font-bold text-[#EB8A14]">
                              {product.selectedWeight}
                            </span>
                          </p>
                        )}

                        {/* Price */}
                        <p className="text-lg font-bold text-[#96580D] mb-2">
                          {currency}
                          {(product.displayOfferPrice * product.quantity).toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-[#bfd9bde0] rounded-lg p-1 border border-[#EB8A14]">
                            <button
                              onClick={() =>
                                cartItems[product.cartKey] > 1
                                  ? updateCartItem(
                                      product.cartKey,
                                      cartItems[product.cartKey] - 1
                                    )
                                  : removeFromCart(product.cartKey)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#EB8A14]/20 transition-colors text-[#EB8A14]"
                            >
                              <Minus size={16} strokeWidth={2.5} />
                            </button>
                            <span className="w-8 text-center font-bold text-[#0a6134] text-sm">
                              {cartItems[product.cartKey]}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItem(
                                  product.cartKey,
                                  cartItems[product.cartKey] + 1
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#EB8A14]/20 transition-colors text-[#EB8A14]"
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                          </div>

                          {/* REMOVE BUTTON – NOW ALWAYS FULL REMOVE */}
                          <button
                            onClick={() => removeFromCart(product.cartKey)}
                            className="flex items-center gap-1 text-xs text-[#785427] hover:text-[#EB8A14] font-medium transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartArray.length > 0 && (
            <div className="border-t-4 border-[#EB8A14] bg-white p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#785427] text-sm font-medium">Subtotal</span>
                <span className="text-xl font-bold text-[#96580D]">
                  {currency}
                  {cartSubtotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full group flex items-center justify-center gap-2 bg-[#EB8A14] hover:bg-[#e27c00] text-white font-bold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
                className="w-full text-[#0a6134] hover:text-[#EB8A14] font-semibold py-1 transition-colors text-xs"
              >
                Continue Shopping
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/cart");
                }}
                className="w-full text-[#0a6134] hover:text-[#EB8A14] font-semibold py-1 transition-colors text-xs"
              >
                View Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
