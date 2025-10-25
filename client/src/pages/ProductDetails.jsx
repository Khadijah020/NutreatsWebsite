import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ChevronRight, ShoppingCart, Truck, Shield, ZoomIn } from "lucide-react";
import { categories } from "../assets/assets";

const ProductDetails = () => {
  const {
    products,
    navigate,
    currency,
    addToCart,
    cartItems,
    updateCartItem,
  } = useAppContext();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  // ✅ Load product and related products
  useEffect(() => {
    const found = products.find((item) => item._id === id);
    if (found) {
      setProduct(found);
      if (found.weights?.length > 0) setSelectedWeight(found.weights[0]);

      const related = products
        .filter(
          (item) => item.category === found.category && item._id !== found._id
        )
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id, products]);

  if (!product)
    return <p className="text-center py-10 text-gray-600">Loading...</p>;

  // ✅ Compute prices safely
  const currentPrice = selectedWeight ? selectedWeight.price : product.price;
  const currentOfferPrice = selectedWeight
    ? selectedWeight.offerPrice
    : product.offerPrice;
  const discount =
    currentPrice > currentOfferPrice
      ? Math.round(((currentPrice - currentOfferPrice) / currentPrice) * 100)
      : 0;

  // ✅ Cart logic
  const cartKey = `${product._id}_${selectedWeight?.weight || "default"}`;
  const isInCart = cartItems && cartItems[cartKey] > 0;

  // ✅ Add to cart handler with debugging + meta storage
const handleAddToCart = async () => {
  try {
    //console.log("🛒 Adding to cart:", product.name, selectedWeight);

    // Create unique key (product + weight)
    const key = `${product._id}_${selectedWeight?.weight || "default"}`;

    // Prepare meta info for cart (price, offer price, etc.)
    const cartMeta = JSON.parse(localStorage.getItem("cartMeta") || "{}");
    cartMeta[key] = {
      price: selectedWeight?.price || product.price,
      offerPrice: selectedWeight?.offerPrice || product.offerPrice,
    };
    localStorage.setItem("cartMeta", JSON.stringify(cartMeta));

    // Update context cart items
    addToCart(product._id, selectedWeight);
    updateCartItem(key, (cartItems[key] || 0) + 1);


    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  } catch (err) {
    console.error("❌ Add to cart failed:", err);
  }
};


  const handleUpdateCart = (newQuantity) => {
    if (newQuantity <= 0) updateCartItem(cartKey, 0);
    else updateCartItem(cartKey, newQuantity);
  };

  return (
    <div className="bg-[#e6dbcee0] min-h-screen px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-600 text-sm mb-6 max-w-6xl mx-auto flex-wrap gap-1">
        <span
          className="cursor-pointer hover:text-green-700"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <ChevronRight size={16} />
        <span
          className="cursor-pointer hover:text-green-700"
          onClick={() => navigate(`/category/${product.category}`)}
        >
          {product.category}
        </span>
        <ChevronRight size={16} />
        <span className="text-green-700 font-semibold">{product.name}</span>
      </div>

      {/* Product Card */}
      <div className="bg-white shadow-lg rounded-2xl max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10">
        {/* Left: Image Gallery */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full max-w-sm h-80 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src={product.image?.[thumbnail] ?? product.image?.[0]}
              alt={product.name}
              className="object-contain h-full w-full cursor-zoom-in transition-transform duration-500 hover:scale-105"
              onClick={() => setShowZoom(true)}
            />
            <button
              onClick={() => setShowZoom(true)}
              className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow hover:scale-105 transition"
            >
              <ZoomIn className="text-gray-600 w-5 h-5" />
            </button>
          </div>

          {product.image?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name}-${index}`}
                  onClick={() => setThumbnail(index)}
                  className={`w-20 h-20 rounded-xl border-2 object-cover cursor-pointer transition-all ${
                    thumbnail === index
                      ? "border-green-600 shadow-md"
                      : "border-gray-200 hover:border-green-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              {Array.isArray(product.description)
                ? product.description.join(" ")
                : product.description}
            </p>

            {/* Weight Selector */}
            {product.weights?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Select Weight</h3>
                <div className="flex flex-wrap gap-3">
                  {product.weights.map((w) => (
                    <button
                      key={w._id}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-4 py-2 rounded-full border font-medium transition ${
                        selectedWeight?.weight === w.weight
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-300 text-gray-700 hover:border-green-600"
                      }`}
                    >
                      {w.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="flex items-center gap-4 py-4">
              <span className="text-5xl font-extrabold text-green-600">
                {currency}
                {currentOfferPrice}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    {currency}
                    {currentPrice}
                  </span>
                  <span className="text-md bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Add to Cart or Quantity Control */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isInCart ? (
                <>
                  <div className="flex items-center justify-between border rounded-xl w-full sm:w-1/2">
                    <button
                      onClick={() => handleUpdateCart(cartItems[cartKey] - 1)}
                      className="px-4 py-2 text-lg font-semibold hover:text-green-600"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold text-gray-800 border-x border-gray-200">
                      {cartItems[cartKey]}
                    </span>
                    <button
                      onClick={() => handleUpdateCart(cartItems[cartKey] + 1)}
                      className="px-4 py-2 text-lg font-semibold hover:text-green-600"
                    >
                      +
                    </button>
                  </div>
                  <button
  onClick={() => {
    handleAddToCart();
    navigate("/cart");
  }}
  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
>
  Buy Now
</button>

                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button
  onClick={() => {
    //console.log("⚡ Buy Now clicked:", product.name);
    handleAddToCart();
    navigate("/cart");
  }}
  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
>
  Buy Now
</button>

                </>
              )}
            </div>

            {addedMessage && (
              <p className="text-green-700 text-sm font-medium bg-green-50 border border-green-200 rounded-lg py-2 mt-3 text-center">
                ✓ Added to cart successfully!
              </p>
            )}
          </div>

          {/* Guarantee Icons */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-gray-600">
            <div className="flex flex-col items-center">
              <Truck size={28} className="text-green-600 mb-1" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield size={28} className="text-green-600 mb-1" />
              <span className="text-sm font-medium">Secure Packaging</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingCart size={28} className="text-green-600 mb-1" />
              <span className="text-sm font-medium">Trusted Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related._id} product={related} />
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {showZoom && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowZoom(false)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.image?.[thumbnail] ?? product.image?.[0]}
              alt="Zoomed"
              className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
            />
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-3 right-3 bg-white/80 p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
