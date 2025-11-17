import React, { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const FeaturedProducts = () => {
  const { products, navigate } = useAppContext();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ✅ Filter for featured products that are in stock
  const featuredProducts = products
    .filter((product) => product.isFeatured && product.inStock)
    .slice(0, 10);

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 300; // Fixed scroll amount
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [featuredProducts]);

  if (featuredProducts.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <div className="mt-12 mb-16 relative w-full px-4 sm:px-6 lg:px-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Handpicked favorites, specially curated for you
        </p>
      </div>

      {/* Products Carousel */}
      <div className="relative max-w-7xl mx-auto">
        {/* Desktop Arrows - Only show if more than 5 products and can scroll */}
        {featuredProducts.length > 5 && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 sm:p-3 rounded-full bg-white shadow-lg hover:bg-[#bfd9bd] transition-all hidden md:flex items-center justify-center border-2 border-[#EB8A14]"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#EB8A14]" />
          </button>
        )}

        {featuredProducts.length > 5 && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 sm:p-3 rounded-full bg-white shadow-lg hover:bg-[#bfd9bd] transition-all hidden md:flex items-center justify-center border-2 border-[#EB8A14]"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#EB8A14]" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth py-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-4 sm:gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex-shrink-0 w-[180px] sm:w-[290px]"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll Indicators */}
        {featuredProducts.length > 5 && (
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-white shadow-md border border-[#EB8A14]"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-[#EB8A14]" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-white shadow-md border border-[#EB8A14]"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-[#EB8A14]" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-[#EB8A14] hover:text-[#d89c52] font-semibold text-base sm:text-lg transition-colors group"
        >
          View All Products
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturedProducts;