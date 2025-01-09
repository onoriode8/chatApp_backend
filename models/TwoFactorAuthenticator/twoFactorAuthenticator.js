const mongoose = require("mongoose");



const twoFactorAuthenticator = new mongoose.Schema({
    secret: { type: String, required: true, trim: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId,
        required: true, trim: true, ref: "Users" }
});


const twoFactorAuthenticatorModel = 
    mongoose.model("TwoFactorAuthenticator", twoFactorAuthenticator);


module.exports = twoFactorAuthenticatorModel;