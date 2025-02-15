const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    
    orderId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    payment:{
        type: String,
        required: true
    },
    orderDate: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    deliveryDate: {
        type: Date,
        default: Date.now
    },
    products: {
        type: Array,
        required: true
    }

})

module.exports = mongoose.model('Order', OrderSchema)