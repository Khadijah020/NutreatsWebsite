import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { ArrowLeft, Search, X } from "lucide-react";

const AllProducts = () => {
  const { products, searchQuery, setSearchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const {navigate} = useAppContext();

  // Extract unique categories from products
  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];
    setCategories(uniqueCategories);
  }, [products]);

  // Sync local search with context
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

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

      <div className="mt-16 px-4 sm:px-6 lg:px-8 w-full bg-[#f8faf7] min-h-screen py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        {/* Section Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a6134] uppercase tracking-wide">
            All Products
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-[#EB8A14] to-[#F2B469] rounded-full mx-auto mt-3"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#785427] w-5 h-5" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search products by name, description, or category..."
              className="w-full pl-12 pr-12 py-3 rounded-full border-2 border-[#F2B469]/30 focus:border-[#EB8A14] focus:outline-none bg-white text-[#0a6134] placeholder-[#785427]/50 shadow-sm transition-all duration-300"
            />
            {localSearchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#785427] hover:text-[#EB8A14] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {localSearchQuery && (
            <p className="text-[#785427] mt-3 text-sm md:text-base text-center">
              Showing results for "<span className="font-semibold text-[#EB8A14]">{localSearchQuery}</span>"
            </p>
          )}
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-8 relative">
          {/* Desktop: Flex Wrap */}
          <div className="hidden md:flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 border-2 ${
                  selectedCategory === category
                    ? 'bg-[#EB8A14] text-white shadow-lg scale-105 border-[#F2B469]'
                    : 'bg-[#bfd9bd] text-[#0a6134] hover:bg-[#F2B469]/30 hover:shadow border-[#F2B469]/30'
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

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex gap-2 px-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-[#EB8A14] text-white shadow-lg border-[#F2B469]'
                      : 'bg-[#bfd9bd] text-[#0a6134] active:bg-[#F2B469]/30 border-[#F2B469]/30'
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
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Results Summary */}
        <div className="mb-6 text-center">
          <p className="text-[#785427] text-sm md:text-base">
            Showing <span className="font-semibold text-[#0a6134]">{inStockProducts.length}</span> {inStockProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' && (
              <span> in <span className="font-semibold text-[#EB8A14]">{selectedCategory}</span></span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {inStockProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {inStockProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="group relative bg-[#bfd9bde0] rounded-2xl p-1 shadow-xl border border-[#F2B469]/20 max-w-md mx-auto">
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#EB8A14]/30 rounded-tl-xl" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#EB8A14]/30 rounded-br-xl" />
              
              <div className="bg-white/50 rounded-xl p-8 relative">
                <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#F2B469]/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#F2B469]/30 rounded-bl-lg" />
                
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[#EB8A14]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-lg text-[#0a6134] font-semibold mb-2">
                  {localSearchQuery 
                    ? `No products found for "${localSearchQuery}"`
                    : selectedCategory !== 'All'
                    ? `No products available in ${selectedCategory}`
                    : "No products available at the moment"}
                </p>
                <p className="text-[#785427] text-sm mb-4">
                  {localSearchQuery || selectedCategory !== 'All' 
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Please check back later for new arrivals."
                  }
                </p>
                {(localSearchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      clearSearch();
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-[#EB8A14] to-[#96580D] text-white rounded-full hover:from-[#96580D] hover:to-[#EB8A14] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-[#F2B469]/30"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AllProducts;