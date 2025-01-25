const mongoose = require('mongoose');

const combinationSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    attributes: {
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
        }
    },
    quantityWithPrice: [{
        quantity: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Combination', combinationSchema)