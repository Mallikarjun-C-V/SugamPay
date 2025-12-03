const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Unique ID for this transaction (useful for tracking)
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    // The App that sent the user (e.g., "MyEcomProject")
    sourceApp: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    // Payment Status
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    // User Details (DUMMY DATA ONLY)
    cardHolderName: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String, 
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Transaction', transactionSchema);