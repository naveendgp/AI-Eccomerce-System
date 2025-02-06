const Registeration = require('../Models/RegistrationModel');
const verifyToken = require('../Middleware/auth');
const express = require('express')

const Router = express.Router();

Router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await Registeration.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = Router;