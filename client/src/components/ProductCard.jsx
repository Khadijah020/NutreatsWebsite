import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../context/AppContext";
import { fetchAPI } from '../utils/api';

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const [categoryData, setCategoryData] = useState(null);
  const [showWeightPopup, setShowWeightPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Weight selection that ONLY affects popup/cart — NOT the card display
  const [selectedWeight, setSelectedWeight] = useState(
    product?.weights?.[0] || null
  );

  // Fetch category name
  useEffect(() => {
    const load = async () => {
      if (!product?.category) return;

      try {
        const data = await fetchAPI('/api/category/list');
        if (data.success) {
          const foundCategory = data.categories.find(
            (c) => c.name.toLowerCase() === product.category.toLowerCase()
          );
          setCategoryData(foundCategory);
        }
      } catch (err) {
        console.error("Category load error:", err);
      }
    };

    load();
  }, [product?.category]);

  if (!product) return null;

  // -------------------------
  // CARD PRICE (STATIC)
  // -------------------------
  const basePrice = product.weights?.length
    ? product.weights[0].price
    : product.price;

  const baseOfferPrice = product.weights?.length
    ? product.weights[0].offerPrice
    : product.offerPrice;

  const baseDiscount =
    basePrice > baseOfferPrice
      ? Math.round(((basePrice - baseOfferPrice) / basePrice) * 100)
      : 0;

  // -------------------------
  // CART LOGIC
  // -------------------------
  const cartKey = selectedWeight
    ? `${product._id}_${selectedWeight.weight}`
    : product._id;

  const quantity = cartItems?.[cartKey] || 0;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (product.weights?.length > 0) {
      setShowWeightPopup(true);
    } else {
      addToCart(cartKey, selectedWeight);
    }
  };

  // -------------------------
  // WEIGHT POPUP (PORTAL)
  // -------------------------
  const WeightPopup = () => (
    <>
      <div
        onClick={() => setShowWeightPopup(false)}
        className="fixed inset-0 bg-black/30 z-[9998]"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[9999] bg-white rounded-2xl shadow-2xl p-6 border-2 border-[#EB8A14] w-[90%] sm:w-[400px] max-h-[80vh] overflow-y-auto bottom-4 right-4"
      >
        <button
          onClick={() => setShowWeightPopup(false)}
          className="absolute top-4 right-4 text-[#785427] hover:text-[#96580D] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#bfd9bd]/30 transition-colors border border-[#EB8A14]"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-[#0a6134] mb-5 pr-8">Select Weight</h3>

        <div className="space-y-3 mb-6">
          {product.weights.map((w, i) => {
            const isSelected = selectedWeight?.weight === w.weight;
            const wDiscount =
              w.price > w.offerPrice
                ? Math.round(((w.price - w.offerPrice) / w.price) * 100)
                : 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedWeight(w)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#EB8A14] bg-[#bfd9bd]/30 shadow-md"
                    : "border-gray-200 hover:border-[#EB8A14] hover:bg-[#bfd9bd]/10"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="font-bold">{w.weight}</span>
                    {wDiscount > 0 && (
                      <span className="text-xs text-[#EB8A14] font-semibold block">
                        {wDiscount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[#0a6134] font-bold text-lg block">
                      {currency}
                      {w.offerPrice}
                    </span>
                    {wDiscount > 0 && (
                      <span className="text-xs line-through text-gray-500">
                        {currency}
                        {w.price}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cart Controls */}
        <div className="flex items-center gap-3">
          {quantity === 0 ? (
            <button
              className="flex-1 bg-[#EB8A14] text-white py-3 rounded-xl font-bold hover:bg-[#d89c52]"
              onClick={() => {
                addToCart(cartKey, selectedWeight);
                setShowWeightPopup(false);
              }}
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-[#bfd9bd]/30 border-2 border-[#EB8A14] rounded-xl">
              <button
                onClick={() => removeFromCart(cartKey)}
                className="px-5 py-3 text-xl font-bold text-[#0a6134]"
              >
                -
              </button>

              <span className="font-bold">{quantity}</span>

              <button
                onClick={() => addToCart(cartKey, selectedWeight)}
                className="px-5 py-3 text-xl font-bold text-[#0a6134]"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // -------------------------
  // MAIN CARD UI
  // -------------------------
  return (
    <>
      <div
        onClick={() =>
          navigate(`/${product.category.toLowerCase()}/${product.slug}`)
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-[#bfd9bde0] rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden h-full flex flex-col border border-[#EB8A14]"
        style={{
          transform: isHovered
            ? "perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-8px)"
            : "none",
        }}
      >
        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Discount badge */}
        {baseDiscount > 0 && (
          <div className="absolute top-3 right-3 z-20 bg-[#F2B469] text-[#0a6134] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#785427]/20">
            {baseDiscount}% OFF
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl bg-white/90 border border-[#EB8A14]">
          <img
            src={product.image[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Desktop hover button */}
          <div className="hidden sm:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition items-end justify-center pb-4">
            <button
              onClick={handleAddClick}
              className="bg-[#EB8A14] text-white px-6 py-2.5 rounded-full font-semibold shadow-xl border-2 border-[#F2B469]/50"
            >
              Quick Add
            </button>
          </div>

          {/* Mobile Add */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddClick(e);
            }}
            className="sm:hidden absolute bottom-2 right-2 bg-[#0a6134] text-white text-xs px-3 py-1.5 rounded-lg"
          >
            Add
          </button>
        </div>

        {/* Product Info */}
        <p className="text-[#785427] text-xs uppercase tracking-wide mb-1">
          {categoryData?.name || product.category}
        </p>

        <h3
          className="text-[#0a6134] font-bold text-sm line-clamp-2 mb-2"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Prices */}
        <div className="mt-auto">
          {/* ✔ CLEAN “starting from” text */}
          {product.weights?.length > 1 && (
            <p className="text-xs text-gray-600 mb-0.5">
              Starting from{" "}
              
            </p>
          )}
          <p className="text-lg font-bold text-[#96580D]">
            {currency}
            {baseOfferPrice}
          </p>

          
        </div>
      </div>

      {/* Popup portal */}
      {showWeightPopup && createPortal(<WeightPopup />, document.body)}
    </>
  );
};

export default ProductCard;
