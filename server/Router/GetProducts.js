const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();

        if (req.io) {
            req.io.emit('productsFetched', products);
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
}); 

module.exports = router;