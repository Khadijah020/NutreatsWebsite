import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Categories = () => {
  const { navigate } = useAppContext();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}api/category/list`);
        const data = await response.json();
        if (data.success) {
          // Only show active categories
          const activeCategories = data.categories.filter(cat => cat.isActive);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [backendUrl]);

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
  }, [categories]);

  if (loading) {
    return (
      <div className="mt-16 text-center py-10">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

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
          <div className="flex gap-6 sm:gap-8 md:gap-10 px-6 sm:px-12 py-3">
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => {
                  // Smooth out navigation to category page
                  setTimeout(() => {
                    navigate(`/${category.name.toLowerCase()}`, { state: { fromHome: true } });
                  }, 50);
                }}
                className="cursor-pointer group flex flex-col items-center bg-gradient-to-br from-[#AD3A24] to-[#8B2E1A] 
                           rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 
                           min-w-[240px] sm:min-w-[280px] md:min-w-[320px] 
                           p-5 sm:p-6 md:p-7 border-2 border-amber-200/20 relative overflow-hidden"
              >
                {/* Traditional decorative corner pattern */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/30 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/30 rounded-br-3xl"></div>
                
                {/* White Inner Card with Content */}
                <div className="relative bg-[#ecd4d0] rounded-2xl shadow-md w-full p-5 sm:p-6 md:p-7 
                              flex flex-col items-center group-hover:shadow-xl group-hover:scale-[1.02] 
                              transition-all duration-500 min-h-[280px] sm:min-h-[320px] md:min-h-[360px]">
                  
                  {/* Subtle decorative elements on white card */}
                  <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-amber-200/40 rounded-tr-xl"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-amber-200/40 rounded-bl-xl"></div>
                  
                  {/* Image Container - CHANGED: Made image container larger */}
                  {category.image && (
                    <div className="relative mb-4 sm:mb-5 w-full flex justify-center">
                      <div className="absolute inset-0 bg-[#AD3A24]/5 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <img
                        src={category.image}
                        alt={category.name}
                        // CHANGED: Made images significantly larger
                        className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain
                                 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                      />
                    </div>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#AD3A24] group-hover:text-[#8B2E1A] 
                               transition text-center mb-2 sm:mb-3 tracking-wide">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  {category.description && (
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition 
                                text-center leading-relaxed line-clamp-3 px-1">
                      {category.description}
                    </p>
                  )}
                  
                  {/* Decorative bottom accent inside white card */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#AD3A24]/30 rounded-full 
                                group-hover:w-16 group-hover:bg-[#AD3A24]/50 transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;