import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: {                    // ← ADD THIS ENTIRE FIELD!
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: { type: String, default: ''},
  price: { type: Number },
  offerPrice: { type: Number },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  // SEO Metadata
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' }, // SEO keywords (comma-separated)
  imageAltTexts: [{ type: String }], // ALT text for each image
  jsonLdSchema: { type: Object, default: null }, // AI-generated JSON-LD structured data
  weights: [
    {
      weight: { type: String, required: true },
      price: { type: Number, required: true },
      offerPrice: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product