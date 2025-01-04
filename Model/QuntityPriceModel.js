const mongoose = require('mongoose');
const { Schema } = mongoose;

const quntityIthPriceSchema = new Schema({
    combinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combination'
    },
    quantityWithPrice: [{
        quantity: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
});

module.exports = mongoose.model('QuntityPrice', quntityIthPriceSchema);