const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { startSession } = require("mongoose");

const User = require("../../models/user/user");
const TwoFactorAuthenticator = require("../../models/TwoFactorAuthenticator/twoFactorAuthenticator");



// Generate and return secret & QR code for 2MFA
exports.getGeneratedCode = async (req, res) => {
    const userId = req.params.id;

    const reqUserId = req.userData.userId;
    
    if(reqUserId !== userId) return res.status(400).json("User id mismatch");

    const secret = speakeasy.generateSecret({ name: "OnlineBankingWallet" });

    let saveGeneratedCode;
    try {
        saveGeneratedCode = await User.findById({ _id: userId })
    } catch(err) {
        return res.status(500).json("server error");
    }

    if(!saveGeneratedCode._id) return res.status(404).json("id not found");

    let dataURL;
    try {
        dataURL = await QRCode.toDataURL(secret.otpauth_url);
        if (!dataURL) {
            throw new Error("Failed to generate QR Code");
        }
    } catch(err) {
        return res.status(500).json("Failed to generate QrCode.");
    }

    return res.status(200).json({ secret: secret.base32, qrCode: dataURL });
    
}


//function to verify 2MFA code from client
exports.sendCode = async (req, res) => {
    const { code, userId, secret } = req.body;
 
    const reqUserId = req.userData.userId; 

    if(reqUserId !== userId) return res.status(400).json("User id mismatch");

    let data;
    try {
        data = await User.findById({ _id: userId }).populate("twoFactorAuthenticator");
    } catch(err) {
        return res.status(500).json("error occur");
    }

    if(!data || !secret) {
        return res.status(404).json("two factor authenticator not enabled.")
    }

    //function to verify generated 6 digits code from google authenticator app.
    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: code,
        window: 1
    })

    if(!verified) return res.status(403).json("Invalid code")

    const saveTwoFactorAuthenticator = new TwoFactorAuthenticator({
        creatorId: data._id,
        secret: secret
    })

    let session;
    try {
        session = await startSession()
        session.startTransaction()
        await saveTwoFactorAuthenticator.save({session});
        data.twoFactorAuthenticator = saveTwoFactorAuthenticator;
        data.isMFA = verified
        await data.save({session})
        await session.commitTransaction()
        await session.endSession()
    } catch(err) {
        await session.abortTransaction()
        await session.endSession()
        return res.status(500).json("2MFA Failed")
    }

    return res.status(200).json({message:"code added successfully", verified});
}
 
