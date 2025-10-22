import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  if (!product) return null;

  const calculateDiscount = () => {
    if (product.price > product.offerPrice) {
      return Math.round(((product.price - product.offerPrice) / product.price) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();
const quantity = cartItems?.[product._id] || 0;

  return (
    <div
  onClick={() => {
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
    scrollTo(0, 0);
  }}
  className="group border border-gray-200 rounded-xl p-3 md:p-4 bg-white opacity-90 
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:border-green-300
            transform hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500 
            ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer w-full">
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
    <p className="text-gray-500 text-xs sm:text-sm">{product.category}</p>

    <p
      className="text-gray-800 font-medium text-sm sm:text-base truncate w-full"
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

    {/* Price + Cart */}
    <div className="flex items-end justify-between mt-3 pt-2">
      {/* Price */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <p className="text-base sm:text-lg md:text-xl font-semibold text-green-700">
            {currency}
            {product.offerPrice}
          </p>
          {discount > 0 && (
            <span className="text-gray-400 text-xs sm:text-sm line-through">
              {currency}
              {product.price}
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
      onClick={() => addToCart(product._id)}
      aria-label="Add to cart"
    >
      <img src={assets.cart_icon} alt="" className="w-4 h-4" />
      Add
    </button>
  ) : (
    <div className="flex items-center justify-center gap-1 md:gap-2 w-16 md:w-20 h-8 md:h-9 bg-green-100 border border-green-300 rounded select-none">
      <button
        onClick={() => removeFromCart(product._id)}
        className="cursor-pointer text-lg font-medium px-2 h-full hover:bg-green-200 rounded-l transition"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-4 md:w-5 text-center text-sm font-medium">
        {quantity}
      </span>
      <button
        onClick={() => addToCart(product._id)}
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