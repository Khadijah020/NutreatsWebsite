import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch category data from API
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${backendUrl}api/category/list`);
        const data = await response.json();
        if (data.success) {
          const foundCategory = data.categories.find(
            (item) => item.name.toLowerCase() === category.toLowerCase()
          );
          setCategoryData(foundCategory);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [category, backendUrl]);

  // Filter products by category
  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );

  if (loading) {
    return (
      <div className="mt-16 px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-center h-[50vh]">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mt-16 px-4 sm:px-6 md:px-10 lg:px-16">
      {/* Category Title */}
      {categoryData && (
        <div className="flex flex-col items-start sm:items-end w-full sm:w-max mb-6">
          <p className="text-xl sm:text-2xl font-medium">
            {categoryData.name.toUpperCase()}
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