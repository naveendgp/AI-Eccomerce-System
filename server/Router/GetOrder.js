const express = require('express');
const router = express.Router();
const Order = require('../Models/OrderModel');

router.get('/', async (req, res) => {
    try {

        const orders = await Order.find();
        if(!orders){
            return res.status(400).json({message: 'No orders found'});
        }
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

module.exports = router;
