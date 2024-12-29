const mongoose = require("mongoose");



const twoFactorAuthenticator = new mongoose.Schema({
    ascii: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
    base32: { type: String, required: true, trim: true },
    otpauth_url: { type: String, required: true, trim: true },
    qrCode: { type: String, required: true, trim: true },
    secret: { type: String, required: true, trim: true },
    // code: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId,
         required: true, trim: true, ref: "User" }
});


const twoFactorAuthenticatorModel = 
    mongoose.model("TwoFactorAuthenticator", twoFactorAuthenticator);


module.exports = twoFactorAuthenticatorModel;