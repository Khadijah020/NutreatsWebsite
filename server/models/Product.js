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