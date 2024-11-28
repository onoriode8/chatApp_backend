const User = require("../../models/user/user");



//function to get user credential from db.
exports.getUser = async (req, res, next) => {
    const userId = req.params.id;

    let user;
    try {
        user = await User.findById(userId);
    } catch(err) {
        return res.status(500).json("server error in fetcing data");
    }

    if(!user) return res.status(404).json("Can't find user by id provided.");

    user.password = undefined;
    user.OTP = undefined;


    return res.status(200).json(user);

}


//function to get user transaction history with userId.
exports.transactionHistory = async (req, res, next) => {
    const userId = req.params.id;

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