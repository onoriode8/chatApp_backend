const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");


const TransactionHistoryModel = require("../../models/transactionHistory/transactionHistory");
const User = require("./../../models/user/user");



exports.transferFund = async (req, res) => {
    const { walletNumber, fullName, amount, creatorId, description } = req.body;

    //function to retrieve the sender details.
    let createdUser;
    try {
        createdUser = await User.findById({ _id: creatorId })
        .populate("transactionHistory").populate("notification")
    } catch(err) {
        return res.status(500).json("server error");
    } 

    if(!createdUser || createdUser === null) {
        return res.status(404).json("Can't perform a transaction.")
    }

    //function to retrieve receiver walletNumber and information.
    let recipient;
    try {
        recipient = await User.findOne({ walletNumber })
        .populate("transactionHistory").populate("notification")
    } catch(err) {
        return res.status(500).json("server error");
    }

    if(!recipient || recipient === null) {
        return res.status(404).json("account doesn't exist.");
    }
 
    if(recipient.walletNumber !== walletNumber){
        return res.status(400).json("wrong wallet number entered");
    }

    if(recipient.fullname !== fullName) return res.status(404).json("Name doesn't match.")


    if(createdUser.balance < amount) {
        return res.status(426).json("Insufficient balance");
    }
    
    if(createdUser <= 9.99) return res.status(406).json("Funds must be above #10")
    
    const date = new Date();

    //using Transaction to perform ACID ATOMICITY and update balance efficiently. 
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction()

        //Deduct money from sender wallet balance
        createdUser.balance -= amount;
        await createdUser.save({ session }); 

        //Add money to recipient wallet balance
        recipient.balance += amount;
        await recipient.save({ session })

        //generating a unique sessionId for successful transaction.
        const uuidGenerated = uuidv4();
        const sessionId = uuidGenerated.replace(/\D/g, "");

        //transaction for debited user. Thats the sender.
        const createdTransaction = new TransactionHistoryModel({
            senderName: createdUser.fullname ,
            senderWalletNumber: createdUser.walletNumber,
            receiverName: recipient.fullname,
            receiverWalletNumber: recipient.walletNumber,
            amountSent: amount,
            type: "Debit",
            transactionDate: date.toDateString(),
            description: description,
            sessionId: sessionId,
            status: "Successful",
            creatorId: creatorId
        })
        const transaction = await createdTransaction.save({ session });
        createdUser.transactionHistory.push(transaction);
        const transactionMessage = {
            message: `You made a successful transaction of #${amount} to ${recipient.fullname}.`
        }
        createdUser.notification.push(transactionMessage);
        await createdUser.save({ session });
        recipient.transactionHistory.push(transaction);
        await recipient.save({ session });
        await session.commitTransaction(); 
        return res.status(200).json({message: "Successful Transaction"});

    } catch(err) {
        await session.abortTransaction()
        await session.endSession()
        return res.status(403).json("Failed, server error");
    }

} 