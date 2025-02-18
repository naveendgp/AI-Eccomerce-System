const mongoose = require('mongoose');
const express = require('express');
const Order = require('../Models/OrderModel');
const router = express.Router();


router.post('/', async (req, res) => {
    const { orderId, customerName, payment,deliveryDate,products, orderDate, total, status } = req.body;
    console.log(req.body);
    const newOrder = new Order({
        orderId,
        customerName,
        payment,
        orderDate,
        products,
        total,
        status,
        deliveryDate
    });

    try {
        const order = await newOrder.save();
        res.status(201).json({message:"Order placed succesfully",order});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

module.exports = router;