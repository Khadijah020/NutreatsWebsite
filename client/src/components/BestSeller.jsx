import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products, navigate } = useAppContext();

  const bestSellerProducts = products
    .filter(product => product.inStock)
    .slice(0, 10);

  return (
    <div className="mt-16 px-6 md:px-10 lg:px-16 text-center">
      {/* Title + Subtitle */}
      <div className="mb-6">
        <p className="text-2xl md:text-3xl font-semibold text-gray-800">Best Sellers</p>
        <p className="text-gray-500 text-sm mt-1">
          Our most loved products, trusted by customers nationwide
        </p>
      </div>

      {/* Product Grid */}
      {bestSellerProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No best sellers available</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {bestSellerProducts.map((product, index) => (
            <ProductCard key={product._id || index} product={product} />
          ))}
        </div>
      )}

      {/* Centered View All Button */}
      <button
        onClick={() => {
          navigate('/products');
          scrollTo(0, 0);
        }}
        className="text-green-700 hover:text-green-800 font-medium transition mt-8"
      >
        View All →
      </button>
    </div>
  );
};

export default BestSeller;
