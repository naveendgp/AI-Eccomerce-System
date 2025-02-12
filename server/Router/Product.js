const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel'); // Adjust path as needed

router.post('/', async (req, res) => {
    try {
        const {
            productName,
            productCategory,
            productPrice,
            productQuantity,
            productLocation,
            productUnit,
            productFreshness,
            HarvestDate
        } = req.body;

        const productExist = await Product.findOne({ productName });
        if(productExist){
            return res.status(400).json({message: 'Product already exist'});
        }
        // Create new product instance
        const newProduct = new Product({
            productName,
            productCategory,
            productPrice,
            productQuantity,
            productLocation,
            productUnit,
            productFreshness,
            HarvestDate: new Date(HarvestDate)
        });

        // Save to database
        const savedProduct = await newProduct.save();

        // Return success response
        res.status(201).json({
            success: true,
            data: savedProduct,
            message: 'Product created successfully'
        });

    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                errors: messages
            });
        }

        // Handle other errors
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

module.exports = router;