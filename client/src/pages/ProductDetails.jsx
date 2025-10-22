import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { assets, categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { ChevronRight, ShoppingCart, Truck, Shield, ZoomIn } from "lucide-react";

const ProductDetails = () => {
  const { products, navigate, currency, addToCart, cartItems, updateCartItem } = useAppContext();
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const product = products.find((item) => item._id === id);
  const [thumbnail, setThumbnail] = useState(0);
  const [activeTab, setActiveTab] = useState("Product Description");
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (products.length > 0 && product) {
      const similar = products.filter(
        (item) => item.category === product.category && item._id !== product._id
      );
      setRelatedProducts(similar.slice(0, 5));
    }
  }, [products, product]);

  const isInCart = cartItems?.[product?._id] > 0;

  const handleAddToCart = async () => {
    if (!product?._id) return;
    try {
      const result = addToCart(product._id, quantity);
      if (result instanceof Promise) await result;
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f5] to-[#e6dbce] pb-24 lg:pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs sm:text-sm md:text-base text-gray-600 flex flex-wrap gap-1">
          {["Home", "Products", product.category, product.name].map((crumb, i) => {
            const handleClick = () => {
              if (i === 0) navigate("/"); // Home
              else if (i === 1) navigate("/products"); // Products
              else if (i === 2) {
                const categoryItem = categories.find(c => c.text === product.category);
                if (categoryItem) navigate(`/products/${categoryItem.path.toLowerCase()}`);
              }
            };
            return (
              <span
                key={i}
                className={i === 3 ? "text-[#3b7d34] font-medium truncate" : "hover:text-[#3b7d34] cursor-pointer"}
                onClick={i < 3 ? handleClick : undefined}
              >
                {crumb}
                {i < 3 && <ChevronRight className="inline w-3 h-3 mx-0.5" />}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8 lg:space-y-12">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-[1200px] mx-auto">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-md group">
              <div className="relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px]">
                <img
                  src={product.image[thumbnail] ?? product.image[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setShowZoom(true)}
                />
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition"
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setThumbnail(i)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
                    thumbnail === i ? "border-[#3b7d34] shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow space-y-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {Array(5).fill("").map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.round(product.rating) ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                ))}
                <span className="text-gray-500 text-xs sm:text-sm">({product.rating})</span>
              </div>

              <hr className="border-gray-200" />

              {/* Price */}
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#3b7d34]">{currency} {product.price}</p>

              {/* Quantity Selector */}
              {isInCart && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateCartItem(product._id, cartItems[product._id] - 1)}
                      className="px-2 py-1 hover:bg-gray-200 transition font-semibold text-gray-700"
                    >-</button>
                    <span className="px-3 py-1 font-semibold border-x border-gray-300 bg-white">{cartItems[product._id]}</span>
                    <button
                      onClick={() => updateCartItem(product._id, cartItems[product._id] + 1)}
                      className="px-2 py-1 hover:bg-gray-200 transition font-semibold text-gray-700"
                    >+</button>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-7">

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-2 text-sm sm:text-base rounded-lg border-2 border-[#3b7d34] text-[#3b7d34] font-semibold hover:bg-[#3b7d34] hover:text-white transition"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Cart
                </button>
                <button
                  onClick={() => { handleAddToCart(); navigate("/cart"); }}
                  className="py-2 text-sm sm:text-base rounded-lg bg-[#3b7d34] text-white font-semibold hover:bg-[#2d662c] transition shadow-lg shadow-green-900/20"
                >
                  Buy Now
                </button>
              </div>

              {/* Temporary Message */}
              {addedMessage && (
                <div className="mt-2 sm:mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 text-sm font-medium animate-fadeIn">
                  ✓ Added to cart successfully!
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3 sm:space-y-4">
              {[{
                Icon: Truck,
                title: "Free Delivery",
                subtitle: "Estimated delivery by Oct 25-27",
              }, {
                Icon: Shield,
                title: "Safe & Secure Packaging",
                subtitle: "Quality checked before dispatch",
              }].map((item, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                  <item.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b7d34] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.title}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("Product Description")}
              className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-semibold capitalize transition ${
                activeTab === "Product Description"
                  ? "text-[#3b7d34] border-b-2 border-[#3b7d34]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Product Description
            </button>
          </div>
          <div className="p-4 sm:p-5">
            {activeTab === "Product Description" && (
  <div>
    <h3 className="font-semibold text-gray-800 mb-3">About this product</h3>
    <ul className="space-y-2">
      {product.description.map((desc, i) => (
        <li key={i} className="flex items-start gap-2 text-gray-700">
          <span className="text-[#3b7d34] mt-1"></span>
          <span className="text-sm">{desc}</span>
        </li>
      ))}
    </ul>
  </div>
)}

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Related Products</h2>
              <div className="w-14 sm:w-16 h-1 bg-primary rounded-full mx-auto mt-1 sm:mt-2" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-3 sm:mt-4">
              {relatedProducts.filter((p) => p.inStock).map((p, i) => (
                <ProductCard key={i} product={p} />
              ))}
            </div>

            <button
              onClick={() => { navigate("/products"); scrollTo(0, 0); }}
              className="mx-auto block mt-3 sm:mt-4 px-8 sm:px-10 py-2 sm:py-2.5 border border-primary text-primary rounded-md hover:bg-primary/10 transition text-sm sm:text-base"
            >
              See More
            </button>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {showZoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowZoom(false)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img src={product.image[thumbnail] ?? product.image[0]} alt="Zoomed" className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain" />
            <button onClick={() => setShowZoom(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/80 p-2 rounded-full">✕</button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-3 lg:hidden z-50 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500">Total Price</p>
            <p className="text-sm sm:text-base font-bold text-[#3b7d34]">{currency} {product.price * quantity}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#3b7d34] text-white font-semibold rounded-lg hover:bg-[#2d662c] transition shadow-lg"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
