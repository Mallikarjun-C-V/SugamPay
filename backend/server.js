require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors()); // Allow requests from other websites
app.use(express.json()); // Parse incoming JSON data

app.use('/api', paymentRoutes);

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Stop app if DB fails
    }
};

// Simple Route to check if server is working
app.get('/', (req, res) => {
    res.send('SugamPay Server is Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
