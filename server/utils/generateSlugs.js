import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { slugify, generateUniqueSlug } from "./slugify.js";
import { fileURLToPath } from "url";

dotenv.config({ path: "server/.env" });

const generateSlugsForExistingProducts = async () => {
  try {
    console.log("Using Mongo URI:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 🔍 Debug Info
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📁 Collections:", collections.map((c) => c.name));

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    // If products exist, show first one
    if (products.length > 0) {
      console.log("Sample product:", {
        name: products[0].name,
        _id: products[0]._id,
        slug: products[0].slug,
      });
    }

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      if (product.slug) {
        skipped++;
        continue;
      }

      const baseSlug = slugify(product.name);
      const slug = await generateUniqueSlug(baseSlug, Product);

      await Product.findByIdAndUpdate(product._id, { slug });
      console.log(`✅ ${product.name} → ${slug}`);
      updated++;
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${products.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

// ESM-safe way to detect if this file is run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  generateSlugsForExistingProducts();
}

export default generateSlugsForExistingProducts;
