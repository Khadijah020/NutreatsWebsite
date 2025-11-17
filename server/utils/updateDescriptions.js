import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config({ path: "server/.env" });

// Helper to escape regex special chars
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// SEO-optimized product descriptions - short, keyword-focused with formatting
const productDescriptions = {
  "Red Chilli Powder - Tez Lal Mirch": `<strong>Premium hot & spicy red chilli powder</strong> (tez lal mirch). Vibrant red color, intense heat. Authentic Pakistani masala for bold, fiery flavor.`,
  
  "Red Chilli Flakes - Dadar Mirch": `<strong>Crushed red pepper flakes</strong> (dadar mirch). Crunchy texture, moderate heat. Pizza topping, pasta seasoning, spicy garnish.`,
  
  "Black Pepper (Whole) - Sabit Kali Mirch": `<strong>Premium whole black peppercorns</strong> (sabit kali mirch). Aromatic, warm spice. Fresh grinding for authentic flavor.`,
  
  "Black Pepper (Powder) - Kali Mirch Powder": `<strong>Freshly ground black pepper</strong> (kali mirch powder). Sharp, pungent flavor. Essential Pakistani kitchen spice.`,
  
  "White Pepper (Whole) - Dakni Mirch Sabit": `<strong>Whole white peppercorns</strong> (dakni mirch sabit). Milder heat, subtle flavor. Light-colored dishes, elegant seasoning.`,
  
  "White Pepper (Powder) - Dakni Mirch Powder": `<strong>Ground white pepper</strong> (dakni mirch powder). Sharp, clean heat. Chinese cooking, white sauces, cream-based dishes.`,
  
  "Coriander Seed (Whole) - Sabit Dhaniya": `<strong>Whole coriander seeds</strong> (sabit dhaniya). Citrusy, slightly sweet. Aromatic tempering spice.`,
  
  "Coriander Seed (Powder) - Dhaniya Powder": `<strong>Ground coriander powder</strong> (dhaniya powder). Earthy, lemony notes. Essential Pakistani curry base spice.`,
  
  "Turmeric - Haldi": `<strong>Pure golden turmeric powder</strong> (haldi). Bright yellow color, earthy flavor. Anti-inflammatory, healthy spice.`,
  
  "Green Cardamom (Sabz Elaichi)": `<strong>Premium green cardamom pods</strong> (sabz elaichi). Sweet, intensely aromatic. Luxury spice for chai, desserts, biryani.`,
  
  "Clove - Laung": `<strong>Aromatic whole cloves</strong> (laung). Warm, sweet-spicy flavor. Intense aroma, medicinal properties.`,
  
  "Nihari Masala": `<strong>Authentic nihari spice blend</strong>. Rich, aromatic masala. Traditional Lahori slow-cooked curry mix.`,
  
  "Biryani Masala": `<strong>Premium biryani spice blend</strong>. Aromatic, complex flavors. Restaurant-quality rice seasoning.`,
  
  "Qorma Masala": `<strong>Rich qorma spice blend</strong>. Creamy, aromatic masala. Celebratory dish seasoning, wedding special.`,
  
  "Besan Premium": `<strong>Fine gram flour</strong> (besan). Nutty flavor, golden color. Gluten-free chickpea flour, versatile ingredient.`,
  
  "Maida Premium": `<strong>Refined all-purpose flour</strong> (maida). Soft, white flour. Baking essential, smooth texture.`,
  
  "Daal Chana - Bareek": `<strong>Fine split bengal gram</strong> (chana dal). Yellow lentils, nutty taste. Quick-cooking, protein-rich.`,
  
  "Daal Moong": `<strong>Split yellow moong dal</strong>. Light, easily digestible. Mild flavor, nutritious lentils.`,
  
  "Kala Chana": `<strong>Black chickpeas</strong> (kala chana). Nutty, earthy flavor. High-protein, firm texture.`,
  
  "Daal Moong - CHILKA": `<strong>Green moong dal with skin</strong> (chilka). High-fiber, nutritious. Robust flavor, healthy option.`,
  
  "Daal Moong - SAABIT": `<strong>Whole green moong beans</strong> (sabit). Sproutable, fiber-rich. Complete protein, versatile legume.`,
  
  "Basil Seeds (Tukh Malanga)": `<strong>Cooling basil seeds</strong> (tukh malanga/sabja). Refreshing, hydrating. Summer drink essential, gelatin-like texture.`,
  
  "Chia Seeds (Tukhm e Sharbati)": `<strong>Omega-3 rich chia seeds</strong>. Superfood, nutrient-dense. Weight loss aid, healthy fat source.`,
  
  "Lotus Seeds (Makhanay)": `<strong>Crunchy lotus seeds</strong> (makhana). Light, airy texture. Low-calorie snack, protein-rich.`,
  
  "Pumpkin Seeds GREEN (Kaddu k Beej - Sabz)": `<strong>Green pumpkin seeds</strong> (pepitas). Crunchy, nutty flavor. Mineral-rich, zinc source.`,
  
  "Flax Seeds (Alsi k Beej)": `<strong>Omega-3 flax seeds</strong> (alsi). Nutty taste, health benefits. Fiber-rich, heart-healthy.`,
  
  "BLACK Sesame Seed (Siyah Til)": `<strong>Black sesame seeds</strong> (kala til). Intense nutty flavor. Calcium-rich, winter delicacy ingredient.`,
  
  "Pink Salt": `<strong>Himalayan pink salt</strong>. Natural, mineral-rich. Khewra mines, unprocessed, healthy alternative.`,
  
  "White Salt": `<strong>Refined white salt</strong> (sufaid namak). Fine crystals, pure taste. Iodized, everyday cooking essential.`,
  
  "Black Salt (Kala Namak)": `<strong>Kala namak</strong> (black salt). Sulphurous, unique flavor. Tangy, chaat essential, digestive aid.`,
  
  "Mustard Oil": `<strong>Pure mustard oil</strong> (sarson ka tel). Pungent, strong flavor. Golden color, traditional cooking oil.`,
  
  "Desi Ghee": `<strong>Pure clarified butter</strong> (desi ghee). Rich, nutty aroma. Golden liquid gold, authentic taste.`,
  
  "Almonds (Badaam) - American w/o Shell": `<strong>Premium California almonds</strong> (badaam). Crunchy, mildly sweet. Protein-rich, heart-healthy nuts.`,
  
  "Salted Pistachio - Namkeen Pista": `<strong>Roasted salted pistachios</strong>. Savory, crunchy snack. Green kernels, addictive flavor.`,
  
  "Coconut Sliced (Khopra Giri Sliced)": `<strong>Dried coconut slices</strong> (khopra). Sweet, tropical flavor. Desiccated, ready-to-use flakes.`,
  
  "Raisins - Kishmish": `<strong>Sweet golden raisins</strong> (kishmish). Chewy, naturally sweet. Sun-dried, energy-boosting.`,
  
  "Zarda Rang - Food Grade": `<strong>Yellow food color</strong>. Vibrant golden hue. Festive rice coloring, safe edible.`,
  
  "Ispaghol Chilka": `<strong>Psyllium husk</strong> (ispaghol). Natural fiber supplement. Digestive health, gentle laxative.`,
  
  "Saffron (Zaafran)": `<strong>Premium saffron threads</strong> (kesar/zafran). Luxurious golden spice. Aromatic, expensive, floral notes.`,
  
  "Rock Sugar (Misri)": `<strong>Crystal rock sugar</strong> (misri). Mildly sweet, cooling. Crystallized, traditional remedy ingredient.`,
};

const updateProductDescriptions = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    let totalUpdated = 0;
    let totalNotFound = 0;
    let totalErrors = 0;
    const notFoundProducts = [];

    console.log("📝 Updating product descriptions with SEO-optimized content...");
    console.log("─".repeat(70) + "\n");

    for (const [productName, description] of Object.entries(productDescriptions)) {
      try {
        let product = null;

        // Strategy 1: Exact match
        product = await Product.findOne({
          name: { $regex: new RegExp(`^${escapeRegex(productName)}$`, "i") },
        });

        // Strategy 2: Partial match
        if (!product) {
          product = await Product.findOne({
            name: { $regex: new RegExp(escapeRegex(productName), "i") },
          });
        }

        // Strategy 3: Flexible matching
        if (!product) {
          const simplifiedName = productName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
          const flexible = simplifiedName.replace(/\s+/g, "\\s*");
          product = await Product.findOne({
            name: { $regex: new RegExp(flexible, "i") },
          });
        }

        // Strategy 4: Main part matching
        if (!product) {
          const mainPart = productName.split(/[-–(]/)[0].trim();
          if (mainPart.length > 3) {
            product = await Product.findOne({
              name: { $regex: new RegExp(escapeRegex(mainPart), "i") },
            });
          }
        }

        if (product) {
          product.description = description;
          await product.save();
          console.log(`✅ Updated: ${productName}`);
          console.log(`   → Matched DB name: "${product.name}"`);
          totalUpdated++;
        } else {
          console.log(`⚠️  NOT FOUND: ${productName}`);
          notFoundProducts.push(productName);
          totalNotFound++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${productName}: ${error.message}`);
        totalErrors++;
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("📊 UPDATE SUMMARY:");
    console.log("=".repeat(70));
    console.log(`✅ Successfully Updated:    ${totalUpdated}`);
    console.log(`⚠️  Not Found (Skipped):    ${totalNotFound}`);
    console.log(`❌ Errors:                 ${totalErrors}`);
    console.log(`📝 Total Processed:        ${Object.keys(productDescriptions).length}`);
    console.log(`📈 Success Rate:           ${((totalUpdated / Object.keys(productDescriptions).length) * 100).toFixed(1)}%`);
    console.log("=".repeat(70));

    if (notFoundProducts.length > 0) {
      console.log("\n⚠️  PRODUCTS NOT FOUND:");
      console.log("─".repeat(70));
      notFoundProducts.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
    }

    if (totalUpdated > 0) {
      console.log("\n✨ SAMPLE UPDATED PRODUCT:");
      console.log("─".repeat(70));
      const sampleProduct = await Product.findOne({
        description: { $exists: true, $ne: "" },
      });
      if (sampleProduct) {
        console.log(`Name: ${sampleProduct.name}`);
        console.log(`Description: ${sampleProduct.description}`);
      }
    }

    console.log("\n✅ Script completed successfully!");
    return 0;
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    console.error("Stack trace:", error.stack);
    return 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n✅ Database disconnected.");
    } catch (e) {
      console.warn("⚠️ Error disconnecting:", e.message);
    }
    process.exit();
  }
};

console.log("🚀 Starting SEO Product Description Updater...");
console.log("=".repeat(70));
updateProductDescriptions();