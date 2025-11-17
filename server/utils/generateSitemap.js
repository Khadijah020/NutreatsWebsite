import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config({ path: './server/.env' });


const generateSitemap = async () => {
  const baseUrl = 'http://localhost:5173';
  const currentDate = new Date().toISOString();

  try {
    const products = await Product.find({ isActive: true }).select('_id updatedAt');
    const categories = await Category.find({ isActive: true }).select('_id name updatedAt');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  ${categories.map(category => `
  <url>
    <loc>${baseUrl}/category/${category._id}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
  
  ${products.map(product => `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
  
</urlset>`;

    const sitemapPath = path.resolve('client/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log('✅ Sitemap generated successfully!');
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${3 + categories.length + products.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await generateSitemap();
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
