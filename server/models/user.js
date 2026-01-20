import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, sparse: true, required: true },
    password: String,
    cartItems: { type: Object, default: {} },
    hasPassword: { type: Boolean, default: false }, // true = registered, false = guest
    isGuest: { type: Boolean, default: false }, // derived/analytics field
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
