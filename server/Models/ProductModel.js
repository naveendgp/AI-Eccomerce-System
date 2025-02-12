const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productQuantity: {
        type: Number,
        required: true
    },
    productLocation: {
        type: String,
        required: true
    },
    productUnit:{
        type: String,
        required: true  
    },
    productFreshness:{
        type: String,
        required: true
    },
    HarvestDate:{
        type: Date,
        required: true
    },
})

module.exports = mongoose.model("Product", productSchema);
