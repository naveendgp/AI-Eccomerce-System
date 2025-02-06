const express = require('express');
const Registration = require('../Models/RegistrationModel'); 

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
    const role = 'Buyer';

    if (!username || !email || !password) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    try {
        const userExist = await Registration.findOne({ email, username });

        if (userExist) {
            return res.status(422).json({ error: "User already exists" });
        }

        const user = new Registration({ username, email, password, role });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
