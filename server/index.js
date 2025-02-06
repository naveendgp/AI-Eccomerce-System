const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const Register = require('./Router/Register');
const Login = require('./Router/Login');
const AdminLogin = require('./Router/AdminLogin');
const verifyToken  = require('./Router/Verify');

const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/Buyer';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/register', Register);
app.use('/login', Login);
app.use('/adminlogin', AdminLogin);
app.use('/verify', verifyToken);


app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});