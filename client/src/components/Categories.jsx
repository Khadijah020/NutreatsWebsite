import React, { useRef, useState, useEffect } from 'react';
import { categories } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Categories = () => {
  const { navigate } = useAppContext();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    const scrollAmount = container.offsetWidth - 100;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className="mt-16 relative w-full">
      {/* Header */}
      <div className="text-center px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 animate-fadeInUp">
          Explore Our Collection
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-1 max-w-md mx-auto animate-fadeInUp delay-100">
          From fragrant spices to wholesome grains, every product is carefully
          selected for quality and authenticity.
        </p>
      </div>

      {/* Scroll Container */}
      <div className="relative mt-10">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-green-100 transition hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-green-700" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-green-100 transition hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-green-700" />
          </button>
        )}

        {/* Scrollable Categories */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
        >
          <div className="flex gap-3 sm:gap-6 md:gap-8 px-6 sm:px-12 py-3">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(`/products/${category.path.toLowerCase()}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer group flex flex-col items-center bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-300 min-w-[120px] sm:min-w-[150px] p-3"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-14 h-14 sm:w-20 sm:h-20 object-contain mb-2"
                />
                <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600 transition">
                  {category.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
