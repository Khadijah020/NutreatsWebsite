import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import SEO from '../components/SEO'

const Home = () => {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NuTreats",
    "url": "http://localhost:5173/",
    "logo": "http://localhost:5173/assets/logo.png",
    "description": "Preservative-free, all-natural products — spices, lentils, oils, and essentials.",
    "sameAs": [
      "https://facebook.com/NuTreatsHome/",
      "https://instagram.com/nutreatsofficial/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-327-4571600",
      "contactType": "Customer Service",
      "email": "nutreatsofficial@gmail.com",
      "availableLanguage": ["English", "Urdu"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    }
  };

  // Website Schema with Search
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NuTreats",
    "url": "http://localhost:5173/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "http://localhost:5173/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema]
  };

  return (
    <>
      <SEO
        title="NuTreats – Preservative-Free, All-Natural Essentials in Pakistan"
        description="Discover NuTreats: 100% natural and additive-free products including spices, lentils, oils, flour, sugar, and home essentials. Shop online for purity and quality across Pakistan."
        keywords="natural products, preservative-free, no additives, healthy food pakistan, spices, lentils, oils, flour, sugar, masalas, organic essentials, nutreats"
        url="http://localhost:5173/"
        canonicalUrl="http://localhost:5173/"
        image="http://localhost:5173/assets/home-banner.jpg"
        schema={combinedSchema}
      />

      <div className="mt-10">
        <MainBanner />
        <Categories />
        <BestSeller />
      </div>
    </>
  )
}

export default Home
