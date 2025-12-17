import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
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
            required: false,
        },
        price: {
            type: Number,
            required: true,
        },
        offerPrice: {
            type: Number,
            required: true,
        },
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
        required: false,
    },
    guestAddress: {
        type: Object,
        required: false,
    },
    status: {
        type: String,
        enum: [
            'Order Placed',      // Initial status
            'Confirmed',         // Seller confirmed the order
            'Packed',           // Ready for dispatch
            'Dispatched',       // Out for delivery
            'Delivered',        // Successfully delivered
            'Paid',             // Payment received
            'Cancelled',        // Order cancelled
            'Returned'          // Order returned
        ],
        default: 'Order Placed',
    },
    paymentType: {
        type: String,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    deliveryDate: {
        type: Date,
        required: false
    },
    trackingInfo: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model("order", orderSchema);
export default Order;