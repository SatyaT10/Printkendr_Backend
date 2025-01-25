const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
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
    size: [{
        type: String
    }],
    paperType: [{
        type: String
    }],
    printingType: [{
        type: String
    }],
    finishingType: [{
        type: String
    }],
    quantity: [{
        type: Number
    }],
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
        required: true
    },
});

module.exports = mongoose.model('Product', productSchema);