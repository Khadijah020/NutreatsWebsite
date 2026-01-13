import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ChevronRight, ShoppingCart, Truck, Shield, ZoomIn, CheckCircle2, ChevronLeft, ChevronRight as RightArrow } from "lucide-react";
import SEO from "../components/SEO";
import { ArrowLeft } from "lucide-react";
import { trackProductView, trackAddToCart, trackRemoveFromCart } from "../utils/analytics";

// ✅ Fisher-Yates shuffle algorithm for randomizing array
const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [toastMessage, setToastMessage] = useState({ show: false, type: '', text: '' });
  const [categoryData, setCategoryData] = useState(null);
  
  
  const { slug } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Add product to recently viewed
  const addToRecentlyViewed = (productData) => {
    if (!productData) return;

    // Get existing recently viewed from localStorage
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove the current product if it already exists (to avoid duplicates)
    recentlyViewed = recentlyViewed.filter(id => id !== productData._id);
    
    // Add current product to the beginning
    recentlyViewed.unshift(productData._id);
    
    // Keep only last 10 products
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  };

  // Get recently viewed products
  const getRecentlyViewed = (currentProductId) => {
    const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Filter out current product and get product objects
    const recentProducts = recentlyViewedIds
      .filter(id => id !== currentProductId)
      .map(id => products.find(p => p._id === id))
      .filter(p => p && p.inStock) // Only show in-stock products
      .slice(0, 5); // Show only 5 most recent products
    
    setRecentlyViewedProducts(recentProducts);
  };

  useEffect(() => {
    const found = products.find((item) => item.slug === slug);

    if (found) {
      setProduct(found);
      if (found.weights?.length > 0) setSelectedWeight(found.weights[0]);

      // ✅ GET ALL RELATED PRODUCTS, SHUFFLE, THEN TAKE 4
      const relatedInCategory = products.filter(
        (item) => item.category === found.category && item.slug !== found.slug && item.inStock
      );
      
      // Randomize and take 4
      const randomRelated = shuffleArray(relatedInCategory).slice(0, 4);
      setRelatedProducts(randomRelated);

      fetchCategoryData(found.category);
      
      // Add to recently viewed
      addToRecentlyViewed(found);
      
      // Get recently viewed products
      getRecentlyViewed(found._id);
      
      // 📊 Track product view in analytics
      trackProductView(found);
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
    return <p className="text-center py-10 text-[#785427]">Loading...</p>;

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

      // 📊 Track add to cart in analytics
      trackAddToCart(product, 1, selectedWeight);

      showToast('add', '🎉 Added to cart!');
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
    }
  };

  const handleUpdateCart = (newQuantity) => {
    const previousQuantity = cartItems[cartKey] || 0;
    
    if (newQuantity <= 0) {
      updateCartItem(cartKey, 0);
      // 📊 Track remove from cart
      trackRemoveFromCart(product, previousQuantity, selectedWeight);
      showToast('remove', '🗑️ Removed from cart');
    } else {
      updateCartItem(cartKey, newQuantity);
      // 📊 Track quantity change
      if (newQuantity > previousQuantity) {
        trackAddToCart(product, newQuantity - previousQuantity, selectedWeight);
      } else {
        trackRemoveFromCart(product, previousQuantity - newQuantity, selectedWeight);
      }
      showToast('update', '✨ Cart updated!');
    }
  };

  // Enhanced Product Schema with more SEO details
  // Use stored JSON-LD schema if available, otherwise generate dynamically
  let productSchema, breadcrumbSchema, faqSchema;

  if (product.jsonLdSchema) {
    // Use AI-generated schema stored in the database
    productSchema = product.jsonLdSchema.productSchema || null;
    breadcrumbSchema = product.jsonLdSchema.breadcrumbSchema || null;
    faqSchema = product.jsonLdSchema.faqSchema || null;
  }

  // Fallback to dynamic generation if no stored schema
  if (!productSchema) {
    productSchema = {
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
    "offers": product.weights && product.weights.length > 0 
      ? product.weights.map(weight => ({
          "@type": "Offer",
          "url": `http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`,
          "priceCurrency": "PKR",
          "price": weight.offerPrice,
          "availability": product.inStock 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "seller": {
            "@type": "Organization",
            "name": "NuTreats"
          },
          "itemOffered": {
            "@type": "Product",
            "name": `${product.name} - ${weight.weight}`
          }
        }))
      : {
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
    "category": product.category,
    // Add aggregate rating (you can make this dynamic later)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "25"
    }
  };
  }

  if (!breadcrumbSchema) {
    breadcrumbSchema = {
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
  }

  // FAQPage Schema - helps Google show FAQs in search results
  if (!faqSchema && product.faqs && product.faqs.length > 0) {
    faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": product.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  }

  // Combine all schemas
  const allSchemas = [productSchema, breadcrumbSchema];
  if (faqSchema) allSchemas.push(faqSchema);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": allSchemas
  };

  const metaDescription = Array.isArray(product.description)
    ? product.description.join(" ").substring(0, 155)
    : product.description.substring(0, 155);

  return (
    <>
      <SEO
        title={product.metaTitle || `${product.name} - Buy Online | NuTreats Pakistan`}
        description={product.metaDescription || `${metaDescription}... Shop now with free delivery in Lahore. ${discount > 0 ? `Save ${discount}%` : 'Best price guaranteed'}.`}
        keywords={`${product.name}, ${product.category}, buy ${product.name} online, healthy snacks pakistan, ${categoryData?.name || product.category} online`}
        url={`http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`}
        canonicalUrl={`http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`}
        image={product.image[0]}
        type="product"
        schema={combinedSchema}
      />

      {/* Toast Notification */}
      {toastMessage.show && (
        <div className="fixed top-24 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-[#EB8A14] min-w-[280px]">
            <div className="bg-[#bfd9bde0] p-2 rounded-full border border-[#EB8A14]">
              <CheckCircle2 className="text-[#0a6134] w-6 h-6" />
            </div>
            <div>
              <p className="text-[#0a6134] font-semibold text-sm">
                {toastMessage.text}
              </p>
              <p className="text-[#785427] text-xs mt-0.5">
                {toastMessage.type === 'add' && 'Item added successfully'}
                {toastMessage.type === 'update' && 'Quantity updated'}
                {toastMessage.type === 'remove' && 'Item removed'}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="bg-white min-h-screen px-4 sm:px-6 py-10 mt-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        {/* Breadcrumb */}
        <nav 
          className="flex items-center text-[#785427] text-sm mb-6 max-w-6xl mx-auto flex-wrap gap-1"
          aria-label="Breadcrumb"
        >
          <span
            className="cursor-pointer hover:text-[#EB8A14] transition"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <ChevronRight size={16} />
          <span
            className="cursor-pointer hover:text-[#EB8A14] transition"
            onClick={() => navigate(`/${product.category.toLowerCase()}`)}
          >
            {categoryData?.name || product.category}
          </span>
          <ChevronRight size={16} />
          <span className="text-[#EB8A14] font-semibold">{product.name}</span>
        </nav>

        {/* Product Card */}
        <article className="bg-[#bfd9bde0] rounded-2xl p-1 shadow-xl border-4 border-[#EB8A14] max-w-6xl mx-auto">
          <div className="bg-[#bfd9bde0] rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-10">
            {/* Left: Image Gallery */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative w-full max-w-sm h-80 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-[#EB8A14]">
                <img
                  src={product.image?.[thumbnail] ?? product.image?.[0]}
                  alt={(product.imageAltTexts && product.imageAltTexts[thumbnail]) || `${product.name} - ${categoryData?.name || product.category}`}
                  className="object-contain h-full w-full cursor-zoom-in transition-transform duration-500 hover:scale-105"
                  onClick={() => setShowZoom(true)}
                />
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:scale-105 transition border-2 border-[#EB8A14]"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="text-[#EB8A14] w-5 h-5" />
                </button>
              </div>

              {product.image?.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product.image.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={(product.imageAltTexts && product.imageAltTexts[index]) || `${product.name} view ${index + 1}`}
                      onClick={() => setThumbnail(index)}
                      className={`w-20 h-20 rounded-xl border-2 object-cover cursor-pointer transition-all ${
                        thumbnail === index
                          ? "border-[#EB8A14] shadow-md scale-105"
                          : "border-[#EB8A14] hover:border-[#EB8A14]"
                      }`}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-3 text-[#0a6134]">{product.name}</h1>
                <div
                  className="text-[#785427] leading-relaxed mb-6 prose prose-sm max-w-none"
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
                    <h3 className="font-semibold text-lg mb-2 text-[#0a6134]">Select Weight</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.weights.map((w) => (
                        <button
                          key={w._id}
                          onClick={() => setSelectedWeight(w)}
                          className={`px-4 py-2 rounded-full border-2 cursor-pointer font-medium text-lg transition ${
                            selectedWeight?.weight === w.weight
                              ? "bg-[#EB8A14] text-white border-[#EB8A14] shadow-md"
                              : "border-[#EB8A14] text-[#0a6134] hover:border-[#EB8A14] bg-[#bfd9bde0]"
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
                  <span className="text-4xl font-extrabold text-[#96580D]">
                    {currency}
                    {currentOfferPrice}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-2xl text-[#785427] line-through">
                        {currency}
                        {currentPrice}
                      </span>
                      <span className="text-md bg-[#bfd9bde0] text-[#96580D] px-3 py-1 rounded-full font-semibold border-2 border-[#EB8A14]">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Add to Cart or Quantity Control */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {isInCart ? (
                    <>
                      <div className="flex items-center justify-between border-2 border-[#EB8A14] rounded-xl w-full sm:w-1/2 bg-[#bfd9bde0]">
                        <button
                          onClick={() => handleUpdateCart(cartItems[cartKey] - 1)}
                          className="px-4 py-2 text-lg font-semibold text-[#EB8A14] hover:text-[#EB8A14]"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold text-[#0a6134] border-x-2 border-[#EB8A14]">
                          {cartItems[cartKey]}
                        </span>
                        <button
                          onClick={() => handleUpdateCart(cartItems[cartKey] + 1)}
                          className="px-4 py-2 text-lg font-semibold text-[#EB8A14] hover:text-[#EB8A14]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/cart");
                        }}
                        className="bg-[#EB8A14] hover:bg-[#EB8A14] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#EB8A14]"
                      >
                        Buy Now
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-2 bg-[#EB8A14] hover:bg-[#EB8A14] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#EB8A14]"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart();
                          navigate("/cart");
                        }}
                        className="bg-[#EB8A14] hover:bg-[#EB8A14] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#EB8A14]"
                      >
                        Buy Now
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Guarantee Icons */}
              <div className="mt-10 grid grid-cols-3 gap-6 text-[#785427]">
                <div className="flex flex-col items-center">
                  <div className="bg-[#bfd9bde0] p-3 rounded-full border-2 border-[#EB8A14] mb-2">
                    <Truck size={28} className="text-[#EB8A14]" />
                  </div>
                  <span className="text-sm font-medium text-center">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-[#bfd9bde0] p-3 rounded-full border-2 border-[#EB8A14] mb-2">
                    <Shield size={28} className="text-[#EB8A14]" />
                  </div>
                  <span className="text-sm font-medium text-center">Secure Packaging</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-[#bfd9bde0] p-3 rounded-full border-2 border-[#EB8A14] mb-2">
                    <ShoppingCart size={28} className="text-[#EB8A14]" />
                  </div>
                  <span className="text-sm font-medium text-center">Trusted Quality</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* FAQs Section */}
        {product.faqs && product.faqs.length > 0 && (
          <section className="mt-12 max-w-6xl mx-auto bg-[#bfd9bde0] rounded-2xl border-2 border-[#EB8A14] p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight mb-6 text-[#0a6134] flex items-center gap-2">
              <span className="text-3xl">❓</span>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {product.faqs.map((faq, index) => (
                <details 
                  key={index} 
                  className="group bg-[#e9a654] rounded-xl border-2 border-[#EB8A14] overflow-hidden transition-all duration-300"
                >
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-[#0a6134] hover:bg-[#EB8A14] hover:text-white transition-colors duration-300 flex items-start gap-3 list-none">
                    <span className="mt-0.5 text-[#EB8A14] group-hover:text-white transition-colors">▸</span>
                    <span className="flex-1">{faq.question}</span>
                  </summary>
                  <div className="px-5 py-4 bg-white border-t-2 border-[#EB8A14]">
                    <p className="text-[#785427] leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight mb-6 text-[#0a6134] text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((related) => (
                <div 
                  key={related._id} 
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{ minHeight: '320px' }}
                >
                  <ProductCard 
                    product={related} 
                    className="h-full"
                    imageClassName="h-48 md:h-56 object-contain"
                    contentClassName="p-4"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products - Mobile Friendly */}
        {recentlyViewedProducts.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight text-[#0a6134] text-center mb-6">
              Recently Viewed
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {recentlyViewedProducts.map((viewed) => (
                <div 
                  key={viewed._id} 
                  className="transform transition-all duration-300 hover:scale-105"
                >
                  <ProductCard 
                    product={viewed}
                    className="h-full"
                  />
                </div>
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
                alt={(product.imageAltTexts && product.imageAltTexts[thumbnail]) || `${product.name} - zoomed view`}
                className="max-w-[90vw] max-h-[80vh] rounded-lg object-contain"
              />
              <button
                onClick={() => setShowZoom(false)}
                className="absolute top-3 right-3 bg-[#bfd9bde0] p-2 rounded-full hover:bg-[#bfd9bde0] transition text-[#EB8A14] hover:text-[#EB8A14] border-2 border-[#EB8A14]"
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