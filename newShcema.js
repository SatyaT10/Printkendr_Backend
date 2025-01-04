
const mongoose = require('mongoose');


// const productSchema = new mongoose.Schema({
//     categoryId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Category'
//     },
//     productName: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String
//     },
//     size: [{
//         type: String
//     }],
//     paperType: [{
//         type: String
//     }],
//     printingType: [{
//         type: String
//     }],
//     finishingType: [{
//         type: String
//     }],
//     quantity: [{
//         type: Number
//     }],

// });

// module.exports = mongoose.model('Product', productSchema);



// Main Combination Schema
const combinationSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    size: {
        type: String,
        required: true
    },
    paperType: {
        type: String,
        required: true
    },
    printingType: {
        type: String,
        required: true
    },
    finishingType: {
        type: String,
        required: true
    },
});

module.exports =  mongoose.model('Combination', combinationSchema)




// const { Size, PaperType, PrintingType, FinishingType, Quantity } = require('./models');

// // Save Sizes
// await Size.insertMany([{ name: 'A4' }, { name: 'A5' }, { name: 'A6' }]);

// // Save Paper Types
// await PaperType.insertMany([
//     { name: '120gsm' },
//     { name: '130gsm' },
//     { name: '100gsm' },
// ]);

// // Save Printing Types
// await PrintingType.insertMany([{ name: 'Glossy' }, { name: 'Matte' }]);

// // Save Finishing Types
// await FinishingType.insertMany([{ name: 'Fold' }, { name: 'Staple' }]);

// // Save Quantities
// await Quantity.insertMany([{ value: 100 }, { value: 200 }, { value: 300 }]);





const { Combination } = require('./models');

const sizes = await Size.find();
const paperTypes = await PaperType.find();
const printingTypes = await PrintingType.find();
const finishingTypes = await FinishingType.find();
const quantities = await Quantity.find();

for (const size of sizes) {
    for (const paperType of paperTypes) {
        for (const printingType of printingTypes) {
            for (const finishingType of finishingTypes) {
                for (const quantity of quantities) {
                    const price = Math.random() * 100; // Calculate or fetch price dynamically
                    await Combination.create({
                        size: size._id,
                        paperType: paperType._id,
                        printingType: printingType._id,
                        finishingType: finishingType._id,
                        quantity: quantity._id,
                        price,
                    });
                }
            }
        }
    }
}




const combinations = await Combination.find()
    .populate('size')
    .populate('paperType')
    .populate('printingType')
    .populate('finishingType')
    .populate('quantity');

combinations.forEach((combination) => {
    console.log({
        size: combination.size.name,
        paperType: combination.paperType.name,
        printingType: combination.printingType.name,
        finishingType: combination.finishingType.name,
        quantity: combination.quantity.value,
        price: combination.price,
    });
});
