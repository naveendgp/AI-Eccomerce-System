const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io'); // Import Server from socket.io
const Register = require('./Router/Register');
const Login = require('./Router/Login');
const AdminLogin = require('./Router/AdminLogin');
const verifyToken = require('./Router/Verify');
const AddProduct = require('./Router/Product');
const GetProduct = require('./Router/GetProducts');
const singleProduct = require('./Router/SingleProduct');
const chatbot = require('./Router/Huggingface');
const DeleteProduct = require('./Router/DeleteProduct');
const UpdateProduct = require('./Router/UpdateProduct');
const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Create an HTTP server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const mongoURI = 'mongodb+srv://madhiuksha:madhi%40551@mernstack.ymu81.mongodb.net/Buyer';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const Product = require('./Models/ProductModel');
// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('chatMessage', (message) => {
        console.log('Message received:', message);
        // Broadcast the message to all connected clients
        io.emit('chatMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Routes
app.use('/register', Register);
app.use('/login', Login);
app.use('/adminlogin', AdminLogin);
app.use('/verify', verifyToken);
app.use('/addProduct', AddProduct);
app.use('/getProduct', GetProduct);
app.use('/singleProduct', singleProduct);
app.use('/deleteProduct', DeleteProduct);
app.use('/updateProduct', UpdateProduct);
app.use('/chatbot', chatbot);

// Start the server
server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});