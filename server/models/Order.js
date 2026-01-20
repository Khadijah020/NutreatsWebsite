import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: false,
    },
    customerPhone: {
        type: String,
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
    shippingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zipcode: Number,
        country: String,
    },
    guestAddress: {
        type: Object,
        required: false,
    },
    status: {
        type: String,
        enum: [
            'Order Placed',
            'Confirmed',
            'Packed',
            'Dispatched',
            'Delivered',
            'Cancelled',
            'Returned'
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