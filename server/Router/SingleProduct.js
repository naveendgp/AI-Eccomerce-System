const express = require('express')
const router = express.Router()
const Product = require('../Models/ProductModel')

router.get('/:productName', async (req, res) => {

    try{
        const product = await Product.findOne({productName: req.params.productName})
        if(!product){
            return res.status(404).json({message: 'Product not found'})
        }
        res.status(200).json({ success: true, data: product })
    }catch(err){
        console.error('Error fetching product:', err)
        res.status(500).json({ success: false, message: 'Error fetching product', error: err.message })
    }
})

module.exports = router