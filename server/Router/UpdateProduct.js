const Product = require('../Models/ProductModel')
const router = require('express').Router()

router.put('/:productName', async (req, res) => {

    const productName = req.params.productName
    console.log(req.body)

    try{
        const product = await Product.findOne({productName: productName})   
        if(!product){
            return res.status(404).json({message: "Product not found",data: product})
        }
        const updatedProduct = await Product.updateOne({ productName: productName }, { $set: req.body })    
        res.json({message: "Product updated",data: updatedProduct})
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Failed to process request"})
    }   

})
module.exports = router