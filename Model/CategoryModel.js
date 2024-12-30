const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    categoryDescription: {
        type: String,
        default: "No description available"
    },
    categoryImage: {
        type: String,
        default: "default-image.jpg"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;