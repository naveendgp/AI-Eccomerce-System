const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    
    CustomerName:{type: String },
    Products:{type:String},
    Price:{type:Number},
    Status:{type:String},
    Payment:{type:String},
    OrderDate:{type:String},
    DeliveryDate:{type:String},


})

const Order = mongoose.model('Order', OrderSchema)
module.exports = Order