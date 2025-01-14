const User = require("../../models/user/user");



//function to get user credential from db.
exports.getUser = async (req, res, next) => {
    const userId = req.params.id;
    const reqUserId = req.userData.userId;
    
    if(reqUserId !== userId) return res.status(400).json("User id mismatch");

    let user;
    try {
        user = await User.findById(userId);
        if(user === null || undefined) {
            return res.status(422).json("User not found.");
        }

        if(user.isMFA === true) {
            user = await User.findById(userId)
            .populate("twoFactorAuthenticator")
        } else if(user.isMFA === false) {
            user = await User.findById(userId)
        } 
    } catch(err) {
        return res.status(500).json("server error in fetcing data");
    }

    if(!user) return res.status(404).json("Can't find user by id provided.");

    user.password = undefined;
    user.OTP = undefined;

    //user.twofactorAuthenticator.secret

    return res.status(200).json(user);

}


//function to get user transaction history with userId.
exports.transactionHistory = async (req, res, next) => {
    const userId = req.params.id;

    const reqUserId = req.userData.userId;
    
    if(reqUserId !== userId) return res.status(400).json("User id mismatch");

    let transaction;
    try {
        transaction = await User.findById(userId).populate("transactionHistory");
    } catch(err) {
        return res.status(500).json("server error in fetcing data");
    }


    if(!transaction || transaction === null) {
        return res.status(404).json("User not found.");
    }


    return res.status(200).json({ transactionHistory: transaction.transactionHistory })

 }


 //function to retrieve user wallet number for confirmation if wallet exist.
 exports.getWalletNumber = async (req, res, next) => {
    const recipientWalletNumber = req.params.recipientWalletNumber;

    const reqUserId = req.userData.userId;
    
    if(!reqUserId) return res.status(400).json("User id mismatch");


    let walletNumber;
    try {
        walletNumber = await User.findOne({ walletNumber: recipientWalletNumber }); 
    } catch(err) {
        return res.status(500).json("wallet number not found.");
    }

    if(!walletNumber) return res.status(404).json("This wallet number doesn't belong to anyone.")
        
    walletNumber.password = undefined;
    walletNumber.OTP = undefined;

    return res.status(200).json({
        walletNumber: walletNumber.walletNumber, fullname: walletNumber.fullname
    })
 
}