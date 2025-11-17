import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config({ path: "server/.env" });

// Categories extracted from your product data
const categoriesData = [
  {
    name: "Spices",
    description: "Premium quality spices including hot, mild, bitter, sweet, and aromatic varieties. From red chilli powder to cardamom and everything in between.",
    isActive: true
  },
  {
    name: "EverydayMasalas",
    description: "Ready-to-use recipe masalas and taste makers. Perfect blends for Nihari, Biryani, Tandoori, Karahi, and more traditional dishes.",
    isActive: true
  },
  {
    name: "Lentils",
    description: "Fresh lentils, daals, premium rice, and flours. Including washed lentils, desi varieties, and basmati rice.",
    isActive: true
  },
  {
    name: "Seeds",
    description: "Nutritious seeds including pomegranate, chia, flax, pumpkin, sesame, and more for healthy eating.",
    isActive: true
  },
  {
    name: "Salts",
    description: "Premium salts including pink Himalayan salt, white salt, and black salt (kala namak).",
    isActive: true
  },
  {
    name: "Oils",
    description: "Pure and natural oils including mustard oil and authentic desi ghee.",
    isActive: true
  },
  {
    name: "Delightful",
    description: "Natural delights including unprocessed honey, premium dates, desi shakkar, and suji.",
    isActive: true
  },
  {
    name: "Namkeen",
    description: "Traditional Pakistani snacks and accompaniments including daal bhalla, pakorian, chat papri, and chutneys.",
    isActive: true
  },
  {
    name: "DryFruits",
    description: "Premium dry fruits including almonds, pistachios, cashews, coconut, and raisins.",
    isActive: true
  },
  {
    name: "Specials",
    description: "Specialty items including saffron, kachri powder, food-grade colors, ispaghol, and silver fennel.",
    isActive: true
  }
];

const importCategories = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("📁 Starting Category Import...");
    console.log("=".repeat(60));

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const categoryData of categoriesData) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        
        if (existingCategory) {
          console.log(`⏭️  Skipped (already exists): ${categoryData.name}`);
          totalSkipped++;
          continue;
        }

        // Create new category
        const category = new Category({
          name: categoryData.name,
          description: categoryData.description,
          image: "", // Can be added later
          isActive: categoryData.isActive
        });

        await category.save();
        console.log(`✅ Imported: ${categoryData.name}`);
        totalImported++;

      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped (duplicate): ${categoryData.name}`);
          totalSkipped++;
        } else {
          console.error(`❌ Error importing ${categoryData.name}: ${error.message}`);
          totalErrors++;
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Import Summary:");
    console.log(`   ✅ Imported: ${totalImported}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`   📦 Total Attempted: ${totalImported + totalSkipped + totalErrors}`);
    console.log("=".repeat(60));

    // Display all categories
    if (totalImported > 0 || totalSkipped > 0) {
      console.log("\n📋 Current Categories in Database:");
      console.log("─".repeat(60));
      const allCategories = await Category.find().sort({ name: 1 });
      allCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} ${cat.isActive ? '✓' : '✗'}`);
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Category import completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Category import failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run import
importCategories();