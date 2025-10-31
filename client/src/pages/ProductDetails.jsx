import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ChevronRight, ShoppingCart, Truck, Shield, ZoomIn, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";

const ProductDetails = () => {
  const {
    products,
    navigate,
    currency,
    addToCart,
    cartItems,
    updateCartItem,
  } = useAppContext();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [toastMessage, setToastMessage] = useState({ show: false, type: '', text: '' });
  const [categoryData, setCategoryData] = useState(null);
  const { slug } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    const found = products.find((item) => item.slug === slug);

    if (found) {
      setProduct(found);
      if (found.weights?.length > 0) setSelectedWeight(found.weights[0]);

      const related = products
        .filter(
          (item) => item.category === found.category && item.slug !== found.slug
        )
        .slice(0, 4);
      setRelatedProducts(related);

      fetchCategoryData(found.category);
    }
  }, [slug, products]);

  const fetchCategoryData = async (categoryName) => {
    try {
      const response = await fetch(`${backendUrl}api/category/list`);
      const data = await response.json();
      if (data.success) {
        const foundCategory = data.categories.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        setCategoryData(foundCategory);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const showToast = (type, text) => {
    setToastMessage({ show: true, type, text });
    setTimeout(() => setToastMessage({ show: false, type: '', text: '' }), 3000);
  };

  if (!product)
    return <p className="text-center py-10 text-gray-600">Loading...</p>;

  const currentPrice = selectedWeight ? selectedWeight.price : product.price;
  const currentOfferPrice = selectedWeight
    ? selectedWeight.offerPrice
    : product.offerPrice;
  const discount =
    currentPrice > currentOfferPrice
      ? Math.round(((currentPrice - currentOfferPrice) / currentPrice) * 100)
      : 0;

  const cartKey = `${product._id}_${selectedWeight?.weight || "default"}`;
  const isInCart = cartItems && cartItems[cartKey] > 0;

  const handleAddToCart = async () => {
    try {
      const key = `${product._id}_${selectedWeight?.weight || "default"}`;

      const cartMeta = JSON.parse(localStorage.getItem("cartMeta") || "{}");
      cartMeta[key] = {
        price: selectedWeight?.price || product.price,
        offerPrice: selectedWeight?.offerPrice || product.offerPrice,
      };
      localStorage.setItem("cartMeta", JSON.stringify(cartMeta));

      addToCart(product._id, selectedWeight);
      updateCartItem(key, (cartItems[key] || 0) + 1);

      showToast('add', '🎉 Added to cart!');
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
    }
  };

  const handleUpdateCart = (newQuantity) => {
    if (newQuantity <= 0) {
      updateCartItem(cartKey, 0);
      showToast('remove', '🗑️ Removed from cart');
    } else {
      updateCartItem(cartKey, newQuantity);
      showToast('update', '✨ Cart updated!');
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": Array.isArray(product.description)
      ? product.description.join(" ")
      : product.description,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "NuTreats"
    },
    "offers": {
      "@type": "Offer",
      "url": `http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`,
      "priceCurrency": "PKR",
      "price": currentOfferPrice,
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "NuTreats"
      }
    },
    "category": product.category
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "http://localhost:5173"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryData?.name || product.category,
        "item": `http://localhost:5173/${product.category.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema]
  };

  const metaDescription = Array.isArray(product.description)
    ? product.description.join(" ").substring(0, 155)
    : product.description.substring(0, 155);

  return (
    <>
      <SEO
        title={`${product.name} - Buy Online | NuTreats Pakistan`}
        description={`${metaDescription}... Shop now with free delivery in Lahore. ${discount > 0 ? `Save ${discount}%` : 'Best price guaranteed'}.`}
        keywords={`${product.name}, ${product.category}, buy ${product.name} online, healthy snacks pakistan, ${categoryData?.name || product.category} online`}
        url={`http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`}
        canonicalUrl={`http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`}
        image={product.image[0]}
        type="product"
        schema={combinedSchema}
      />

      {/* Cute Toast Notification */}
      {toastMessage.show && (
        <div className="fixed top-24 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-[#D4A574] min-w-[280px]">
            <div className="bg-[#F5EBE0] p-2 rounded-full">
              <CheckCircle2 className="text-[#D4A574] w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm">
                {toastMessage.text}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {toastMessage.type === 'add' && 'Item added successfully'}
                {toastMessage.type === 'update' && 'Quantity updated'}
                {toastMessage.type === 'remove' && 'Item removed'}
              </p>
            </div>
          </div>
        </div>
      )}

      <style >{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="bg-[#faf7f2] min-h-screen px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav 
          className="flex items-center text-gray-600 text-sm mb-6 max-w-6xl mx-auto flex-wrap gap-1"
          aria-label="Breadcrumb"
        >
          <span
            className="cursor-pointer hover:text-[#AD3A24] transition"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <ChevronRight size={16} />
          <span
            className="cursor-pointer hover:text-[#AD3A24] transition"
            onClick={() => navigate(`/${product.category.toLowerCase()}`)}
          >
            {categoryData?.name || product.category}
          </span>
          <ChevronRight size={16} />
          <span className="text-[#AD3A24] font-semibold">{product.name}</span>
        </nav>

        {/* Product Card */}
        <article className="bg-white shadow-xl rounded-3xl max-w-6xl mx-auto overflow-hidden">
          {/* Inner card */}
          <div className="bg-[#ecd4d0] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-10 relative">
            {/* Subtle decorative elements on inner card */}
            <div className="absolute top-3 right-3 w-12 h-12 border-t border-r border-amber-200/40 rounded-tr-2xl"></div>
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b border-l border-amber-200/40 rounded-bl-2xl"></div>

            {/* Left: Image Gallery */}
            <div className="flex-1 flex flex-col items-center relative z-10">
              <div className="relative w-full max-w-sm h-80 bg-white/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-md border border-amber-100/50">
                <img
                  src={product.image?.[thumbnail] ?? product.image?.[0]}
                  alt={`${product.name} - ${categoryData?.name || product.category}`}
                  className="object-contain h-full w-full cursor-zoom-in transition-transform duration-500 hover:scale-105"
                  onClick={() => setShowZoom(true)}
                />
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow hover:scale-105 transition border border-amber-200/50"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="text-[#AD3A24] w-5 h-5" />
                </button>
              </div>

              {product.image?.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product.image.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      onClick={() => setThumbnail(index)}
                      className={`w-20 h-20 rounded-xl border-2 object-cover cursor-pointer transition-all ${
                        thumbnail === index
                          ? "border-[#AD3A24] shadow-md scale-105"
                          : "border-amber-200/60 hover:border-[#AD3A24]/60"
                      }`}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div>
                <h1 className="text-3xl font-bold mb-3 text-[#8B2E1A]">{product.name}</h1>
                <div
                  className="text-gray-700 leading-relaxed mb-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const desc = product.description;
                      if (typeof desc === "string") {
                        return desc || "No description available.";
                      }
                      if (Array.isArray(desc)) {
                        const cleaned = desc.filter(item => item && item.trim() !== "");
                        return cleaned.length > 0 
                          ? cleaned.join(" ") 
                          : "No description available.";
                      }
                      return "No description available.";
                    })(),
                  }}
                />

                {/* Weight Selector */}
                {product.weights?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2 text-[#8B2E1A]">Select Weight</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.weights.map((w) => (
                        <button
                          key={w._id}
                          onClick={() => setSelectedWeight(w)}
                          className={`px-4 py-2 rounded-full border-2 font-medium transition ${
                            selectedWeight?.weight === w.weight
                              ? "bg-[#AD3A24] text-white border-[#AD3A24] shadow-md"
                              : "border-amber-300/60 text-gray-700 hover:border-[#AD3A24] bg-white/50"
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
                  <span className="text-5xl font-extrabold text-[#AD3A24]">
                    {currency}
                    {currentOfferPrice}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        {currency}
                        {currentPrice}
                      </span>
                      <span className="text-md bg-amber-100 text-[#8B2E1A] px-3 py-1 rounded-full font-semibold border border-amber-200">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Add to Cart or Quantity Control */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {isInCart ? (
                    <>
                      <div className="flex items-center justify-between border-2 border-amber-200/60 rounded-xl w-full sm:w-1/2 bg-white/50">
                        <button
                          onClick={() => handleUpdateCart(cartItems[cartKey] - 1)}
                          className="px-4 py-2 text-lg font-semibold text-[#AD3A24] hover:text-[#8B2E1A]"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-800 border-x-2 border-amber-200/60">
                          {cartItems[cartKey]}
                        </span>
                        <button
                          onClick={() => handleUpdateCart(cartItems[cartKey] + 1)}
                          className="px-4 py-2 text-lg font-semibold text-[#AD3A24] hover:text-[#8B2E1A]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/cart");
                        }}
                        className="bg-[#8B2E1A] hover:bg-[#AD3A24] text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
                      >
                        Buy Now
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-2 bg-[#AD3A24] hover:bg-[#8B2E1A] text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart();
                          navigate("/cart");
                        }}
                        className="bg-[#8B2E1A] hover:bg-[#AD3A24] text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
                      >
                        Buy Now
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Guarantee Icons */}
              {/* <div className="mt-10 grid grid-cols-3 gap-6 text-gray-700">
                <div className="flex flex-col items-center">
                  <div className="bg-white/50 p-3 rounded-full border border-amber-200/50 mb-2">
                    <Truck size={28} className="text-[#AD3A24]" />
                  </div>
                  <span className="text-sm font-medium text-center">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/50 p-3 rounded-full border border-amber-200/50 mb-2">
                    <Shield size={28} className="text-[#AD3A24]" />
                  </div>
                  <span className="text-sm font-medium text-center">Secure Packaging</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/50 p-3 rounded-full border border-amber-200/50 mb-2">
                    <ShoppingCart size={28} className="text-[#AD3A24]" />
                  </div>
                  <span className="text-sm font-medium text-center">Trusted Quality</span>
                </div>
              </div> */}
            </div>
          </div>
        </article>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-[#8B2E1A] text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </section>
        )}

        {/* Zoom Modal */}
        {showZoom && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowZoom(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image zoom"
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.image?.[thumbnail] ?? product.image?.[0]}
                alt={`${product.name} - zoomed view`}
                className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
              />
              <button
                onClick={() => setShowZoom(false)}
                className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition"
                aria-label="Close zoom"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;