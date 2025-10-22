import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: false, sparse: true }, // guest users may share emails
    password: String,
    cartItems: { type: Object, default: {} },
    isGuest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
