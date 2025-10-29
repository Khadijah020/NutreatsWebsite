import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

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

  return (
    <>
      <SEO
        title="All Products - Natural, Preservative-Free & Additive-Free | NuTreats Pakistan"
        description="Explore NuTreats’ full collection of preservative-free, all-natural, and additive-free products. Discover spices, lentils, oils, flour, sugar, recipe masalas, and home essentials – crafted for a healthier lifestyle."
        keywords="natural products, preservative free, no additives, spices, lentils, oils, flour, sugar, recipe masalas, home essentials, healthy groceries, organic food pakistan"
        url="http://localhost:5173/products"
        canonicalUrl="http://localhost:5173/products"
        image="http://localhost:5173/products-banner.jpg"
        schema={combinedSchema}
      />

      <div className="mt-16 px-6 md:px-10 lg:px-16 w-full">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 uppercase">
            All Products
          </h1>
          <div className="w-20 h-0.5 bg-primary rounded-full mx-auto mt-2"></div>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              Showing results for "<span className="font-semibold">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.filter((product) => product.inStock).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts
              .filter((product) => product.inStock)
              .map((product, index) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : "No products available at the moment"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AllProducts;