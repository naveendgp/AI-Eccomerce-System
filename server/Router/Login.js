const express = require('express');
const Registeration = require("../Models/RegistrationModel"); 
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await Registeration.findOne({ email, password });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        res.status(200).json({ msg: 'Login Successful', user });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
