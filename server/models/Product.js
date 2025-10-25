import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Array},
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

productSchema.pre('validate', function (next) {
  if ((!this.price || !this.offerPrice) && (!this.weights || this.weights.length === 0)) {
    next(new Error('Either base price/offerPrice or at least one weight variant is required.'));
  } else {
    next();
  }
});


const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product