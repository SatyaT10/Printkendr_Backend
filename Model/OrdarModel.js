const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_id:{
        type:Number,
        required:true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to Product model
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        size: {
            type: String,
        },
        paperType: {
            type: String,
        },
        printingType: {
            type: String,
        },
        finishingType: {
            type: String,
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    productPdf: {
        type: String,
    },
    status: {
        type: String,
        default: 'pending'
    },
    spicleRemark:{
        type:String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);