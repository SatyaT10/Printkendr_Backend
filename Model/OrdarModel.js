const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
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
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to Product model
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    productPdf:{
        type:String,
    },
    status: {
        type: String,
        default: 'pending'
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