import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const [categoryData, setCategoryData] = useState(null);
  
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

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="group border border-gray-200 rounded-xl p-3 md:p-4 bg-white opacity-90
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-green-300
            transform hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500
            ease-in-out cursor-pointer w-full flex flex-col justify-between
            h-full min-h-[300px] sm:min-h-[330px] max-h-[360px]"
    >
      {/* Image Container */}
      <div className="flex items-center justify-center h-40 sm:h-48 mb-3 overflow-hidden rounded-md">
        <img
          className="group-hover:scale-110 transition-transform duration-500 ease-in-out h-full w-full object-contain"
          src={product.image[0]}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-gray-500 text-xs sm:text-sm">
          {categoryData?.name || product.category}
        </p>

        <p
          className="text-gray-800 font-bold text-sm sm:text-base truncate w-full"
          title={product.name}
        >
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array(5)
            .fill('')
            .map((_, i) => (
              <img
                key={i}
                className="w-3 md:w-3.5"
                src={
                  i < (product.rating || 4)
                    ? assets.star_icon
                    : assets.star_dull_icon
                }
                alt="star"
              />
            ))}
          <p className="text-xs text-gray-500 ml-1">
            ({product.reviewCount || 4})
          </p>
        </div>

        {/* Weight Selector */}
        {product.weights && product.weights.length > 0 && (
          <div onClick={(e) => e.stopPropagation()} className="pt-2">
            <select
              value={selectedWeight?.weight || ''}
              onChange={(e) => {
                const weight = product.weights.find(w => w.weight === e.target.value);
                setSelectedWeight(weight);
              }}
              className="w-full px-2 py-1.5 text-sm border border-green-600 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {product.weights.map((w, index) => (
                <option key={index} value={w.weight}>
                  {w.weight}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-3 pt-2">
          {/* Price */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <p className="text-base sm:text-lg md:text-xl font-bold text-green-700">
                {currency}
                {currentOfferPrice}
              </p>
              {discount > 0 && (
                <span className="text-gray-400 text-xs sm:text-sm line-through">
                  {currency}
                  {currentPrice}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <div onClick={(e) => e.stopPropagation()} className="text-green-700">
            {quantity === 0 ? (
              <button
                className="flex items-center justify-center gap-1 bg-green-50 border border-green-300
                           w-16 md:w-20 h-8 md:h-9 rounded hover:bg-green-100 transition-colors text-xs md:text-sm font-medium"
                onClick={() => addToCart(cartKey, selectedWeight)}
                aria-label="Add to cart"
              >
                <img src={assets.cart_icon} alt="" className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1 md:gap-2 w-16 md:w-20 h-8 md:h-9 bg-green-100 border border-green-300 rounded select-none">
                <button
                  onClick={() => removeFromCart(cartKey)}
                  className="cursor-pointer text-lg font-medium px-2 h-full hover:bg-green-200 rounded-l transition"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-4 md:w-5 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => addToCart(cartKey, selectedWeight)}
                  className="cursor-pointer text-lg font-medium px-2 h-full hover:bg-green-200 rounded-r transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;