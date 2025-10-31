import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { slugify, generateUniqueSlug } from "./slugify.js";

dotenv.config({ path: "server/.env" });

// Product data extracted from your Excel sheets
const productsData = [
  // ========== SPICES ==========
  {
    category: "Spices",
    products: [
      { name: "Red Chilli Powder - Tez Lal Mirch", weights: [{w:"100g",p:170},{w:"200g",p:330},{w:"500g",p:810}] },
      { name: "Red Chilli Powder REGULAR - Lal Mirch", weights: [{w:"100g",p:130},{w:"200g",p:250},{w:"500g",p:600}] },
      { name: "Red Chilli Flakes - Dadar Mirch", weights: [{w:"100g",p:150},{w:"200g",p:290}] },
      { name: "Red Chilli Whole (Gol) - Sabit Lal Mirch (Gol)", weights: [{w:"100g",p:160}] },
      { name: "Talhar Mirch Sabit", weights: [{w:"100g",p:190}] },
      { name: "Kashmiri Mirch Powder", weights: [{w:"100g",p:220}] },
      { name: "Black Pepper (Whole) - Sabit Kali Mirch", weights: [{w:"100g",p:340}] },
      { name: "Black Pepper (Powder) - Kali Mirch Powder", weights: [{w:"100g",p:370}] },
      { name: "White Pepper (Whole) - Dakni Mirch Sabit", weights: [{w:"100g",p:490}] },
      { name: "White Pepper (Powder) - Dakni Mirch Powder", weights: [{w:"100g",p:520}] },
      { name: "Ginger Powder (Adrak Powder)", weights: [{w:"100g",p:330}] },
      { name: "Coriander Seed (Whole) - Sabit Dhaniya", weights: [{w:"100g",p:100},{w:"200g",p:200}] },
      { name: "Coriander Seed (Powder) - Dhaniya Powder", weights: [{w:"100g",p:130},{w:"200g",p:260}] },
      { name: "Turmeric - Haldi", weights: [{w:"100g",p:120},{w:"200g",p:240}] },
      { name: "Black Cumin (Whole) - Sabit Kala Zeera", weights: [{w:"100g",p:430}] },
      { name: "Carom Seeds - (Ajwain)", weights: [{w:"100g",p:70}] },
      { name: "Fenugreek Seeds - Methary", weights: [{w:"100g",p:45}] },
      { name: "Dried Fenugreek Leaves - Kasuri Methi", weights: [{w:"50g",p:40}] },
      { name: "Bay Leaves (Tez Patta)", weights: [{w:"25g",p:40}] },
      { name: "Tamarind (Imli)", weights: [{w:"100g",p:110}] },
      { name: "Green Cardamom (Sabz Elaichi)", weights: [{w:"20g",p:340},{w:"40g",p:680}] },
      { name: "Green Cardamom VIP (Sabz Elaichi VIP)", weights: [{w:"20g",p:490},{w:"40g",p:980}] },
      { name: "Star Anise - Badiyan Khatai", weights: [{w:"50g",p:120}] },
      { name: "Fennel Seeds (Sonf)", weights: [{w:"100g",p:120}] },
      { name: "Black Cardamom (large) - Bari Kali Elaichi", weights: [{w:"50g",p:520}] },
      { name: "Cinnamon - Dar Cheeni", weights: [{w:"100g",p:150}] },
      { name: "IMPORTED Cinnamon - Imported Dar Cheeni", weights: [{w:"50g",p:200},{w:"100g",p:400}] },
      { name: "Clove - Laung", weights: [{w:"50g",p:230},{w:"100g",p:460}] },
      { name: "White Cumin (Whole) - Sabit Sufaid Zeera", weights: [{w:"100g",p:180},{w:"200g",p:360}] },
      { name: "White Cumin (Powder) - Sufaid Zeera Powder", weights: [{w:"100g",p:200}] },
      { name: "Fenugreek Seeds - Methi Dana", weights: [{w:"100g",p:180}] },
      { name: "Garlic Powder - Lehsan Powder", weights: [{w:"100g",p:270}] },
    ]
  },

  // ========== RECIPE SPICES (MASALAS) ==========
  {
    category: "EverydayMasalas",
    products: [
      { name: "Nihari Masala", weights: [{w:"120g",p:250}], description: "For 1 Kg Gosht (Meat/Chicken)" },
      { name: "Super Haleem Mix", weights: [{w:"535g",p:370}], description: "For 1/2 Kg Gosht (Meat/Chicken)" },
      { name: "Biryani Masala", weights: [{w:"100g",p:280}], description: "For 1 Kg Chawal, 1 Kg Gosht" },
      { name: "Tandoori Masala", weights: [{w:"100g",p:280}], description: "For 1-1.5 Kg Gosht" },
      { name: "Achar Gosht Masala", weights: [{w:"80g",p:170}], description: "For 1 Kg Gosht" },
      { name: "Karahi Gosht Masala", weights: [{w:"60g",p:150}], description: "For 1.5 Kg Gosht" },
      { name: "Yakhni Pulao Masala", weights: [{w:"100g",p:260}], description: "1 Kg Meat & Rice" },
      { name: "Katchri Qeema (Dum ka Qeema) Masala", weights: [{w:"100g",p:340}], description: "1.50 Kg Qeema" },
      { name: "Qorma Masala", weights: [{w:"40g",p:150}], description: "1.5 Kg Gosht" },
      { name: "Garam Masala Powder Premium", weights: [{w:"100g",p:400}] },
      { name: "SABIT Garam Masala", weights: [{w:"100g",p:360}] },
      { name: "Chaat Masala", weights: [{w:"100g",p:170}] },
    ]
  },

  // ========== GRAINS & LENTILS ==========
  {
    category: "Lentils",
    products: [
      { name: "Besan Premium", weights: [{w:"500g",p:200},{w:"1kg",p:400}] },
      { name: "Maida Premium", weights: [{w:"500g",p:80},{w:"1kg",p:160}] },
      { name: "Pakora Mix", weights: [{w:"500g",p:250},{w:"1kg",p:500}] },
      { name: "Daal Maash POWDER", weights: [{w:"800g",p:600}] },
      { name: "DAAL MOONG POWDER", weights: [{w:"800g",p:480}] },
      { name: "Barley Porridge (Jou Ka Dalya)", weights: [{w:"500g",p:160},{w:"1kg",p:320}] },
      { name: "Daal Chana - Bareek", weights: [{w:"500g",p:170},{w:"1kg",p:330}] },
      { name: "Daal Moong", weights: [{w:"500g",p:220},{w:"1kg",p:440}] },
      { name: "Daal Maash", weights: [{w:"500g",p:300},{w:"1kg",p:600}] },
      { name: "Daal Masoor", weights: [{w:"500g",p:170},{w:"1kg",p:340}] },
      { name: "Saabit Masar", weights: [{w:"500g",p:170},{w:"1kg",p:330}] },
      { name: "Sufaid Chana - BAREEK", weights: [{w:"500g",p:160},{w:"1kg",p:320}] },
      { name: "Sufaid Chana - MOTA", weights: [{w:"500g",p:250},{w:"1kg",p:490}] },
      { name: "Kala Chana", weights: [{w:"500g",p:180},{w:"1kg",p:360}] },
      { name: "Sufaid Lobia", weights: [{w:"500g",p:210},{w:"1kg",p:420}] },
      { name: "Red Lobia", weights: [{w:"500g",p:330},{w:"1kg",p:660}] },
      { name: "Daal Masoor DESI", weights: [{w:"500g",p:200},{w:"1kg",p:400}] },
      { name: "Saabit Masar DESI", weights: [{w:"500g",p:240},{w:"1kg",p:470}] },
      { name: "Daal Maash - CHILKA", weights: [{w:"500g",p:260},{w:"1kg",p:520}] },
      { name: "Daal Moong - CHILKA", weights: [{w:"500g",p:230},{w:"1kg",p:450}] },
      { name: "Daal Mash - SAABIT", weights: [{w:"500g",p:240}] },
      { name: "Daal Moong - SAABIT", weights: [{w:"500g",p:210}] },
      { name: "Steam Basmati Rice 1121 2Y OLD", weights: [{w:"1kg",p:440},{w:"2kg",p:870},{w:"5kg",p:2150}] },
      { name: "Steam Basmati Rice 1121 1Y OLD", weights: [{w:"1kg",p:400},{w:"2kg",p:790},{w:"5kg",p:1950}] },
      { name: "Corn Flour - Makai Ka Atta", weights: [{w:"1kg",p:400},{w:"2kg",p:800}] },
      { name: "Barley Flour - Jau Ka Atta", weights: [{w:"1kg",p:330},{w:"2kg",p:660}] },
    ]
  },

  // ========== SEEDS ==========
  {
    category: "Seeds",
    products: [
      { name: "Pomegranate Seed (Anardana)", weights: [{w:"100g",p:140}] },
      { name: "Pomegranate Powder (Anardana Powder)", weights: [{w:"100g",p:190}] },
      { name: "Aaloo Bukhara", weights: [{w:"100g",p:120}] },
      { name: "Black Seeds (Kalonji)", weights: [{w:"100g",p:150}] },
      { name: "Basil Seeds (Tukh Malanga)", weights: [{w:"100g",p:160}] },
      { name: "Chia Seeds (Tukhm e Sharbati)", weights: [{w:"100g",p:190}] },
      { name: "Gond Kateera", weights: [{w:"100g",p:280}] },
      { name: "Chaar Gond", weights: [{w:"100g",p:170}] },
      { name: "Lotus Seeds (Makhanay)", weights: [{w:"50g",p:350},{w:"100g",p:700}] },
      { name: "Pumpkin Seeds WHITE (Kaddu k Beej - Sufaid)", weights: [{w:"100g",p:200}] },
      { name: "Pumpkin Seeds GREEN (Kaddu k Beej - Sabz)", weights: [{w:"100g",p:250}] },
      { name: "Flax Seeds (Alsi k Beej)", weights: [{w:"100g",p:70}] },
      { name: "White Sunflower Seeds (Suraj mukhi k beej)", weights: [{w:"100g",p:170}] },
      { name: "White Sesame Seed (Sufaid Til)", weights: [{w:"100g",p:100}] },
      { name: "BLACK Sesame Seed (Siyah Til)", weights: [{w:"100g",p:200}] },
      { name: "Poppy Seeds (Khashkhaash)", weights: [{w:"100g",p:170}] },
      { name: "Chaar Maghaz", weights: [{w:"100g",p:240}] },
      { name: "Mustard Seed - RAI DANA", weights: [{w:"100g",p:170}] },
    ]
  },

  // ========== SALTS ==========
  {
    category: "Salts",
    products: [
      { name: "Pink Salt", weights: [{w:"1000g",p:110}] },
      { name: "White Salt", weights: [{w:"1000g",p:70}] },
      { name: "Black Salt (Kala Namak)", weights: [{w:"100g",p:40}] },
    ]
  },

  // ========== OILS ==========
  {
    category: "Oils",
    products: [
      { name: "Mustard Oil", weights: [{w:"200ml",p:240},{w:"500ml",p:500},{w:"1000ml",p:1000}] },
      { name: "Desi Ghee", weights: [{w:"400g",p:1350},{w:"800g",p:2700}] },
    ]
  },

  // ========== DELIGHTFUL ==========
  {
    category: "Delightful",
    products: [
      { name: "SIDR HONEY - Unprocessed, Khalis, Natural", weights: [{w:"500g",p:2300}] },
      { name: "Wild Flower Honey - Unprocessed, Natural, Khalis", weights: [{w:"500g",p:1600}] },
      { name: "Dates - Piyaram", weights: [{w:"300g",p:440},{w:"600g",p:870}] },
      { name: "Desi Shakkar", weights: [{w:"500g",p:150},{w:"1000g",p:290}] },
      { name: "Suji", weights: [{w:"500g",p:90}] },
    ]
  },

  // ========== NAMKEEN ==========
  {
    category: "Namkeen",
    products: [
      { name: "Khalis Daal Mash Bhalla x 12 nos", weights: [{w:"1/2 Dozen",p:170},{w:"Dozen",p:330}] },
      { name: "Phulkian / Pakorian", weights: [{w:"200g",p:200}] },
      { name: "Chat Papri", weights: [{w:"100g",p:130}] },
      { name: "Imli Aloo Bukhara Chatni", weights: [{w:"100g",p:200},{w:"200g",p:400}] },
      { name: "Dahi Bhalla Masala", weights: [{w:"100g",p:170}] },
      { name: "DAHI BHALLA PACKAGE", weights: [{w:"package",p:900}], description: "Bhalla 1 dz, Pakorian 200g, Papri 100g, Imli Aloo Bukhara Chatni 100ml, Bhalla Masala 30g" },
    ]
  },

  // ========== DRY FRUITS ==========
  {
    category: "DryFruits",
    products: [
      { name: "Almonds (Badaam) - American w/o Shell", weights: [{w:"100g",p:360},{w:"200g",p:710},{w:"400g",p:1400}] },
      { name: "Sliced Almonds", weights: [{w:"100g",p:450}] },
      { name: "Salted Pistachio - Namkeen Pista", weights: [{w:"100g",p:360},{w:"200g",p:720}] },
      { name: "Plain Pista Giri", weights: [{w:"50g",p:320},{w:"100g",p:620}] },
      { name: "Coconut Sliced (Khopra Giri Sliced)", weights: [{w:"100g",p:140}] },
      { name: "Raisins - Kishmish", weights: [{w:"100g",p:120}] },
    ]
  },

  // ========== SPECIALS ==========
  {
    category: "Specials",
    products: [
      { name: "Kachri Powder", weights: [{w:"100g",p:150}] },
      { name: "Zarda Rang - Food Grade", weights: [{w:"20g",p:100}] },
      { name: "Biryani Rang - Food Grade", weights: [{w:"20g",p:100}] },
      { name: "Ispaghol Chilka", weights: [{w:"100g",p:750}] },
      { name: "Saffron (Zaafran)", weights: [{w:"1g",p:1000}] },
      { name: "Silver Fennel - Silver Saunf", weights: [{w:"20g",p:220},{w:"50g",p:500}] },
      { name: "Sweet Fennel-Meethi Saunf", weights: [{w:"50g",p:30}] },
      { name: "Rock Sugar (Misri)", weights: [{w:"100g",p:60}] },
    ]
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

          // Create product with weights
          const product = new Product({
            name: productData.name,
            slug,
            description: productData.description || "Premium quality product",
            category: categoryGroup.category,
            price: null, // Using weights only
            offerPrice: null,
            image: [], // Will add later
            weights: productData.weights.map(w => ({
              weight: w.w,
              price: w.p,
              offerPrice: w.p // Same as price (no discount)
            })),
            inStock: true,
          });

          await product.save();
          console.log(`✅ ${productData.name} → ${slug}`);
          totalImported++;

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
    console.log(`   ✅ Imported: ${totalImported}`);
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

// Run import
importProducts();