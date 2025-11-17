// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false, // ✅ now optional
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        weight: {
            type: String,
            required: false, // ✅ Added weight field - optional for products without variants
        },
        // ✅ NEW: Store price at time of order
        price: {
            type: Number,
            required: true, // Original price
        },
        // ✅ NEW: Store offer price (discounted price) at time of order
        offerPrice: {
            type: Number,
            required: true, // Actual price paid
        },
        // ✅ OPTIONAL: Store product details for historical reference
        name: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
    }],
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address',
        required: false, // ✅ also optional (guest orders may not have saved address)
    },
    guestAddress: {  // ✅ new field for guest users
        type: Object,
        required: false,
    },
    status: {
        type: String,
        default: 'Order Placed!',
    },
    paymentType: {
        type: String,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model("order", orderSchema);
export default Order;