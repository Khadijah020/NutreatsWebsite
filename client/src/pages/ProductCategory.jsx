import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { ArrowLeft } from "lucide-react";
import { fetchAPI } from '../utils/api';

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {navigate} = useAppContext();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        
        const data = await fetchAPI('/api/category/list');
        
        if (data.success) {
          const foundCategory = data.categories.find(
            (item) => item.name.toLowerCase() === category.toLowerCase()
          );
          setCategoryData(foundCategory);
        }
      } catch (error) {
        console.error(' Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [category]);

  // 🔍 Filter products and log them
  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase() && product.inStock
  );
  
  if (loading) {
    return (
      <div className="mt-16 px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-center h-[50vh]">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  // ✅ Category Collection Schema
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryData?.name || category} – NuTreats`,
    "description": categoryData?.description || `Explore preservative-free, all-natural ${category} from NuTreats.`,
    "url": `http://localhost:5173/${category.toLowerCase()}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredProducts.length,
      "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `http://localhost:5173/${category.toLowerCase()}/${product.slug}`,
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

  // ✅ Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "http://localhost:5173" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "http://localhost:5173/products" },
      { "@type": "ListItem", "position": 3, "name": categoryData?.name || category, "item": `http://localhost:5173/${category.toLowerCase()}` }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [categorySchema, breadcrumbSchema]
  };

  const categoryTitle = categoryData?.name || category;
  const seoTitle = `${categoryTitle} – 100% Natural, Preservative-Free ${categoryTitle} | NuTreats Pakistan`;
  const seoDescription =
    categoryData?.description ||
    `Discover pure, chemical-free ${categoryTitle} at NuTreats. Our ${categoryTitle.toLowerCase()} range is made with natural ingredients — no preservatives, no additives. Perfect for healthy living.`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${categoryTitle}, natural ${categoryTitle}, preservative-free ${categoryTitle}, no additives ${categoryTitle}, organic ${categoryTitle}, buy ${categoryTitle} online Pakistan, healthy ${categoryTitle} Lahore, NuTreats`}
        url={`http://localhost:5173/${category.toLowerCase()}`}
        canonicalUrl={`http://localhost:5173/${category.toLowerCase()}`}
        image={categoryData?.image || "http://localhost:5173/category-default.jpg"}
        schema={combinedSchema}
      />

      <div className="mt-5 px-4 sm:px-6 md:px-10 lg:px-16">
        <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-[#785427] hover:text-[#EB8A14] font-semibold mb-4 transition-colors"
>
  <ArrowLeft size={20} />
  Back
</button>
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-4">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li>/</li>
            <li><a href="/products" className="hover:text-primary">Products</a></li>
            <li>/</li>
            <li className="text-primary font-semibold">{categoryTitle}</li>
          </ol>
        </nav>

        {categoryData && (
          <div className="flex flex-col items-start sm:items-end w-full sm:w-max mb-6">
            <h1 className="text-xl sm:text-2xl font-medium">{categoryTitle.toUpperCase()}</h1>
            <div className="w-12 sm:w-16 h-0.5 bg-primary mt-1"></div>
          </div>
        )}

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
    </>
  );
};

export default ProductCategory;
