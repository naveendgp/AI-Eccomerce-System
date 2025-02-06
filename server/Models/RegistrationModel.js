const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String
    }   
})

const Registration = new mongoose.model("Registration",RegistrationSchema)
module.exports = Registration;