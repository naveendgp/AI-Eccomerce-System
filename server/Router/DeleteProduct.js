const Product = require('../Models/ProductModel')
const router = require('express').Router()

router.delete('/:productName', async (req, res) => {

    const productName = req.params.productName

    try{
        const product = await Product.findOne({productName: productName})
        if(!product){
            return res.status(404).json({message: "Product not found"})
        }
        await Product.deleteOne({productName: productName})
        res.json({message: "Product deleted"})

       

    }catch(err){
        console.log(err)
        res.status(500).json({error: "Failed to process request"})
    }
})

module.exports = router