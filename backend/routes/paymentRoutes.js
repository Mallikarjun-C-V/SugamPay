const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// 1. CREATE ORDER (Called by Main Website)
router.post('/create-order', async (req, res) => {
    try {
        const { amount, sourceApp } = req.body;
        const orderId = 'ORD_' + Date.now() + Math.floor(Math.random() * 1000);

        const newOrder = new Order({
            orderId,
            sourceApp,
            amount,
            status: 'created'
        });
        await newOrder.save();

        res.json({ success: true, orderId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET ORDER DETAILS (Called by SugamPay Frontend)
router.get('/get-order/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.status === 'paid') return res.status(400).json({ success: false, message: "Order already paid" });
        
        res.json({ success: true, amount: order.amount, sourceApp: order.sourceApp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. PROCESS PAYMENT (Updated)
router.post('/pay', async (req, res) => {
    try {
        // We now expect an orderId instead of just raw amount
        const { orderId, cardHolderName, cardNumber, cvv } = req.body;

        // Verify Order exists
        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: "Invalid Order ID" });

        // Generate Transaction ID
        const transactionId = 'TXN_' + Date.now();
        const isSuccess = cvv !== '000'; 
        const status = isSuccess ? 'success' : 'failed';

        // Save Transaction
        const newTransaction = new Transaction({
            transactionId,
            sourceApp: order.sourceApp,
            amount: order.amount,
            status,
            cardHolderName,
            cardNumber,
            expiryDate: '00/00', // Simplified for now
            cvv
        });
        await newTransaction.save();

        // Update Order Status
        if (isSuccess) {
            order.status = 'paid';
            order.transactionId = transactionId;
            await order.save();
        }

        if (isSuccess) {
            res.status(200).json({ status: 'success', transactionId });
        } else {
            res.status(400).json({ status: 'failed', message: "Declined" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;