const OrderModel = require('../../Models/OrderModel');
const router = require('express').Router();

router.get("/", async (req, res) => {

    try{
        const Orders = await OrderModel.find()
        res.status(200).json({message:"Orders fetched successfully", Orders})

        if(!Orders){
            return res.status(404).json({message: "No orders found"})
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({error: "Failed to process request"})
    }

})

module.exports = router
