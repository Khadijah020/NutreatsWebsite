import React, { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BestSeller = () => {
  const { products, navigate } = useAppContext();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const bestSellerProducts = products
    .filter((product) => product.inStock)
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
    const scrollAmount = container.offsetWidth - 150;
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
  }, []);

  return (
    <div className="mt-16 relative w-full">
      {/* Title + Subtitle */}
      <div className="text-center px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Best Sellers
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-1 max-w-md mx-auto">
          Our most loved products, trusted by customers nationwide
        </p>
      </div>

      {bestSellerProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No best sellers available
        </p>
      ) : (
        <div className="relative mt-10">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-green-100 transition hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-green-700" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-green-100 transition hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6 text-green-700" />
            </button>
          )}

          {/* Scrollable Product List */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth px-6 sm:px-10"
          >
            <div className="flex gap-4 sm:gap-6 md:gap-8 py-3">
              {bestSellerProducts.map((product, index) => (
                <div
                  key={product._id || index}
                  className="min-w-[180px] sm:min-w-[220px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Centered View All Button */}
      <button
        onClick={() => {
          navigate("/products");
          scrollTo(0, 0);
        }}
        className="text-green-700 hover:text-green-800 font-medium transition mt-8 block mx-auto"
      >
        View All →
      </button>
    </div>
  );
};

export default BestSeller;
