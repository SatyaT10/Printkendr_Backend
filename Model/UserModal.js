const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true
    },
    GSTNumber: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    whatsAppNo: {
        type: String,
        required: true
    },
    is_approved: {
        type: Number,
        default: 0
    },
    remark: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', userSchema);