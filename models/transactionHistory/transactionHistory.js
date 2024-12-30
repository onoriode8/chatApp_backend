const mongoose = require("mongoose");



const transactionHistory = new mongoose.Schema({
    senderName: { type: String, required: true, trim: true },
    senderWalletNumber: { type: String, required: true, trim: true },
    receiverName: { type: String, required: true, trim: true },
    receiverWalletNumber: { type: String, required: true, trim: true },
    amountSent: { type: Number, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    transactionDate: { type: String, required: true, trim: true },
    description: { type: String },
    sessionId: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId,
         required: true, trim: true, ref: "Users" }
});


const transactionHistoryModel = 
    mongoose.model("TransactionHistory", transactionHistory);


module.exports = transactionHistoryModel;