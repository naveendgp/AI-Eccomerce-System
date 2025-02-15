const express = require('express');
const jwt = require('jsonwebtoken');
const Registeration = require("../Models/RegistrationModel");

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Check if the admin exists
        const admin = await Registeration.findOne({ email, role: "Admin" });
        if (!admin) {
            return res.status(401).json({ msg: 'Admin not found or invalid credentials' });
        }

        // If the admin exists, create the JWT token
        const token = jwt.sign(
            { role: admin.role },
            "ADMIN_SECRET",
            { expiresIn: '24h' } 
        );

        // Send success response with the token and admin details
        console.log(token,admin.username,admin.email,admin.role);
        res.status(200).json({
            msg: 'Login Successful',
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                name:admin.name
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
