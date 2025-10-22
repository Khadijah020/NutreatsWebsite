import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === category
  );
  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category
  );

  return (
    <div className="mt-16 px-4 sm:px-6 md:px-10 lg:px-16">
      {/* Category Title */}
      {searchCategory && (
        <div className="flex flex-col items-start sm:items-end w-full sm:w-max mb-6">
          <p className="text-xl sm:text-2xl font-medium">
            {searchCategory.text.toUpperCase()}
          </p>
          <div className="w-12 sm:w-16 h-0.5 bg-primary mt-1"></div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg sm:text-xl font-medium text-primary text-center">
            No products found in this category
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
