import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { slugify, generateUniqueSlug } from "./slugify.js";

dotenv.config({ path: "server/.env" });

// Only the EverydayMasalas category
const productsData = [
  {
    category: "EverydayMasalas",
    products: [
      { name: "Nihari Masala", weights: [{ w: "120g", p: 250 }], description: "For 1 Kg Gosht (Meat/Chicken)" },
      { name: "Super Haleem Mix", weights: [{ w: "535g", p: 370 }], description: "For 1/2 Kg Gosht (Meat/Chicken)" },
      { name: "Biryani Masala", weights: [{ w: "100g", p: 280 }], description: "For 1 Kg Chawal, 1 Kg Gosht" },
      { name: "Tandoori Masala", weights: [{ w: "100g", p: 280 }], description: "For 1-1.5 Kg Gosht" },
      { name: "Achar Gosht Masala", weights: [{ w: "80g", p: 170 }], description: "For 1 Kg Gosht" },
      { name: "Karahi Gosht Masala", weights: [{ w: "60g", p: 150 }], description: "For 1.5 Kg Gosht" },
      { name: "Yakhni Pulao Masala", weights: [{ w: "100g", p: 260 }], description: "1 Kg Meat & Rice" },
      { name: "Katchri Qeema (Dum ka Qeema) Masala", weights: [{ w: "100g", p: 340 }], description: "1.50 Kg Qeema" },
      { name: "Qorma Masala", weights: [{ w: "40g", p: 150 }], description: "1.5 Kg Gosht" },
      { name: "Garam Masala Powder Premium", weights: [{ w: "100g", p: 400 }] },
      { name: "SABIT Garam Masala", weights: [{ w: "100g", p: 360 }] },
      { name: "Chaat Masala", weights: [{ w: "100g", p: 170 }] },
    ],
  },
];

const importProducts = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const categoryGroup of productsData) {
      console.log(`\n📁 Category: ${categoryGroup.category}`);
      console.log("─".repeat(50));

      for (const productData of categoryGroup.products) {
        try {
          // Generate slug
          const baseSlug = slugify(productData.name);
          const slug = await generateUniqueSlug(baseSlug, Product);

          // Create product object
          const product = {
            name: productData.name,
            slug,
            description: productData.description || "Premium quality product",
            category: categoryGroup.category,
            price: null,
            offerPrice: null,
            image: [],
            weights: productData.weights.map((w) => ({
              weight: w.w,
              price: w.p,
              offerPrice: w.p,
            })),
            inStock: true,
          };

          // Upsert (update if exists, else create)
          const existing = await Product.findOne({ name: productData.name });
          if (existing) {
            await Product.updateOne({ _id: existing._id }, { $set: product });
            console.log(`♻️ Updated: ${productData.name}`);
            totalImported++;
          } else {
            await Product.create(product);
            console.log(`✅ Created: ${productData.name}`);
            totalImported++;
          }

        } catch (error) {
          if (error.code === 11000) {
            console.log(`⏭️  Skipped (duplicate): ${productData.name}`);
            totalSkipped++;
          } else {
            console.error(`❌ Error: ${productData.name} - ${error.message}`);
            totalErrors++;
          }
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Import Summary:");
    console.log(`   ✅ Imported/Updated: ${totalImported}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`   📦 Total Attempted: ${totalImported + totalSkipped + totalErrors}`);
    console.log("=".repeat(50));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
};

importProducts();
