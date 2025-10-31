import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  // Extract unique categories from products
  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];
    setCategories(uniqueCategories);
  }, [products]);

  // Filter products by search and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.length > 0) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  // 🧠 Collection Page Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Products - NuTreats Pakistan",
    "description": "Explore preservative-free, no-additives, all-natural products from NuTreats Pakistan. Discover our range of spices, lentils, oils, flour, sugar, recipe masalas, and home essentials.",
    "url": "http://localhost:5173/products",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredProducts.filter(p => p.inStock).length,
      "itemListElement": filteredProducts
        .filter(p => p.inStock)
        .slice(0, 10)
        .map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.name,
            "url": `http://localhost:5173/${product.category.toLowerCase()}/${product.slug}`,
            "image": product.image[0],
            "offers": {
              "@type": "Offer",
              "price": product.offerPrice || product.price,
              "priceCurrency": "PKR",
              "availability": "https://schema.org/InStock"
            }
          }
        }))
    }
  };

  // 🧭 Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "http://localhost:5173"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "All Products",
        "item": "http://localhost:5173/products"
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [collectionSchema, breadcrumbSchema]
  };

  const inStockProducts = filteredProducts.filter((product) => product.inStock);

  return (
    <>
      <SEO
        title="All Products - Natural, Preservative-Free & Additive-Free | NuTreats Pakistan"
        description="Explore NuTreats' full collection of preservative-free, all-natural, and additive-free products. Discover spices, lentils, oils, flour, sugar, recipe masalas, and home essentials – crafted for a healthier lifestyle."
        keywords="natural products, preservative free, no additives, spices, lentils, oils, flour, sugar, recipe masalas, home essentials, healthy groceries, organic food pakistan"
        url="http://localhost:5173/products"
        canonicalUrl="http://localhost:5173/products"
        image="http://localhost:5173/products-banner.jpg"
        schema={combinedSchema}
      />

      <div className="mt-16 px-6 md:px-10 lg:px-16 w-full">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 uppercase">
            All Products
          </h1>
          <div className="w-20 h-0.5 bg-[#D4A574] rounded-full mx-auto mt-2"></div>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              Showing results for "<span className="font-semibold">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#D4A574] text-white shadow-md scale-105'
                    : 'bg-[#F5EBE0] text-gray-700 hover:bg-[#EDD9C8] hover:shadow'
                }`}
              >
                {category}
                <span className="ml-1.5 text-xs opacity-75">
                  ({products.filter(p => 
                    (category === 'All' || p.category === category) && p.inStock
                  ).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-center">
          {/* <p className="text-gray-600 text-sm md:text-base">
            Showing <span className="font-semibold text-gray-800">{inStockProducts.length}</span> {inStockProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' && (
              <span> in <span className="font-semibold text-[#D4A574]">{selectedCategory}</span></span>
            )}
          </p> */}
        </div>

        {/* Products Grid */}
        {inStockProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {inStockProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : selectedCategory !== 'All'
                ? `No products available in ${selectedCategory}`
                : "No products available at the moment"}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                }}
                className="mt-4 px-6 py-2 bg-[#D4A574] text-white rounded-full hover:bg-[#C49463] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AllProducts;