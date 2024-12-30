const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    priceWithQuenty: [
        {
            price: {
                type: Number
            },
            quantity: {
                type: Number
            }
        }
    ],
    attributes: [
        {
            attribute: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    productImage: {
        type: String,
        // required: true
    }
});

module.exports = mongoose.model('Product', productSchema);