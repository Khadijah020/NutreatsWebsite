import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const [categoryData, setCategoryData] = useState(null);
  const [showWeightPopup, setShowWeightPopup] = useState(false);
  
  // Selected weight state
  const [selectedWeight, setSelectedWeight] = useState(
    product?.weights?.length > 0 ? product.weights[0] : null
  );

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch category data from API for display
  useEffect(() => {
    const fetchCategory = async () => {
      if (!product?.category) return;
      
      try {
        const response = await fetch(`${backendUrl}api/category/list`);
        const data = await response.json();
        if (data.success) {
          const foundCategory = data.categories.find(
            (cat) => cat.name.toLowerCase() === product.category.toLowerCase()
          );
          setCategoryData(foundCategory);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [product?.category, backendUrl]);

  if (!product) return null;

  // Use selected weight price or base price
  const currentPrice = selectedWeight ? selectedWeight.price : product.price;
  const currentOfferPrice = selectedWeight ? selectedWeight.offerPrice : product.offerPrice;

  const calculateDiscount = () => {
    if (currentPrice > currentOfferPrice) {
      return Math.round(((currentPrice - currentOfferPrice) / currentPrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();
  
  // Cart key includes weight if variants exist
  const cartKey = selectedWeight 
    ? `${product._id}_${selectedWeight.weight}` 
    : product._id;
  
  const quantity = cartItems?.[cartKey] || 0;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (product.weights && product.weights.length > 0) {
      setShowWeightPopup(true);
    } else {
      addToCart(cartKey, selectedWeight);
    }
  };

  return (
    <>
      <div
        onClick={() => {
         navigate(`/${product.category.toLowerCase()}/${product.slug}`);
       
        }}
        className="group relative border border-gray-200 rounded-xl p-3 md:p-4 bg-[#AD3A24] opacity-90
              hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-green-300
              transform hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500
              ease-in-out cursor-pointer w-full flex flex-col justify-between
              h-full min-h-[300px] sm:min-h-[330px] max-h-[360px]"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            src={product.image[0]}
            alt={product.name}
            loading="lazy"
          />

          {/* Desktop Hover Add Button */}
          <button
            onClick={handleAddClick}
            className="hidden sm:flex absolute inset-0 items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <span className="bg-[#AD3A24] hover:bg-[#8B2F1C] text-white px-6 py-2 rounded-lg font-medium text-sm md:text-base shadow-lg transform hover:scale-105 transition-transform">
              Add Product
            </span>
          </button>

          {/* Mobile Visible Add Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddClick(e);
            }}
            className="sm:hidden absolute bottom-2 right-2 bg-[#AD3A24] hover:bg-[#8B2F1C] text-white text-xs px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition-transform"
          >
            Add
          </button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <p className="text-white text-xs sm:text-sm">
            {categoryData?.name || product.category}
          </p>

          <p
            className="text-white font-bold text-base sm:text-lg truncate w-full"
            title={product.name}
          >
            {product.name}
          </p>

          {/* Price */}
          <div className="flex flex-col gap-0.5 mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-sm sm:text-lg md:text-xl font-light text-white">
                {currency}
                {currentOfferPrice}
              </p>
              {discount > 0 && (
                <span className="text-white text-xs sm:text-sm line-through">
                  {currency}
                  {currentPrice}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-xs text-white font-medium">
                Save {discount}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weight Selection Popup - Portal Style (Outside Card) */}
      {showWeightPopup && (
        <>
          {/* Backdrop - Full Screen Dark Overlay */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowWeightPopup(false);
            }}
            className="fixed inset-0 bg-black/60 z-[9998]"
          />

          {/* Floating Popup - Fixed Bottom Right */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl p-5 
                       border-2 border-[#AD3A24] w-[90%] sm:w-[360px] max-h-[85vh] 
                       overflow-y-auto
                       bottom-4 right-4 left-4 sm:left-auto
                       animate-slideUp"
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowWeightPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4 pr-8">
              Select Weight
            </h3>

            {/* Weight Options */}
            <div className="space-y-2.5 mb-5">
              {product.weights.map((w, index) => {
                const isSelected = selectedWeight?.weight === w.weight;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedWeight(w)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#AD3A24] bg-red-50 shadow-sm'
                        : 'border-gray-200 hover:border-[#AD3A24]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-base">{w.weight}</span>
                      <span className="text-[#AD3A24] font-bold text-base">
                        {currency} {w.offerPrice}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cart Controls */}
            <div className="flex items-center justify-between gap-2">
              {quantity === 0 ? (
                <button
                  className="flex-1 bg-[#AD3A24] hover:bg-[#8B2F1C] text-white py-3 px-4 rounded-lg font-semibold transition-colors text-base shadow-md hover:shadow-lg"
                  onClick={() => {
                    addToCart(cartKey, selectedWeight);
                    setShowWeightPopup(false);
                  }}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-red-50 border-2 border-[#AD3A24] rounded-lg overflow-hidden">
                  <button
                    onClick={() => removeFromCart(cartKey)}
                    className="px-5 py-3 hover:bg-red-100 transition font-bold text-xl text-[#AD3A24]"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-gray-800 text-lg">{quantity}</span>
                  <button
                    onClick={() => addToCart(cartKey, selectedWeight)}
                    className="px-5 py-3 hover:bg-red-100 transition font-bold text-xl text-[#AD3A24]"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add keyframes for animation */}
      <style >{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;