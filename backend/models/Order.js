const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    sourceApp: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'created' }, // created, paid
    // Link to the final transaction once paid
    transactionId: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);