const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const mongoose = require("mongoose");

const User = require("../../models/user/user");
const TwoFactorAuthenticator = require("../../models/TwoFactorAuthenticator/twoFactorAuthenticator");



// Generate and return secret & QR code
exports.getGeneratedCode = async (req, res) => {
    const userId = req.params.id;

    const secret = speakeasy.generateSecret({ name: "OnlineBankingWallet" });

    let saveGeneratedCode;
    try {
        saveGeneratedCode = await User.findById({ _id: userId })
        .populate("twoFactorAuthenticator");
    } catch(err) {
        return res.status(500).json("server error");
    }

    if(!saveGeneratedCode._id) return res.status(404).json("id not found");
   

    let saveTwoFactorAuthenticator;
    await QRCode.toDataURL(secret.otpauth_url, (err, dataURL) => {
        if (err) {
            return res.status(500).send("Failed to generate QR Code");
        }
        
        saveTwoFactorAuthenticator = new TwoFactorAuthenticator({
            ascii: secret.ascii,
            hex: secret.hex,
            base32: secret.base32,
            otpauth_url: secret.otpauth_url,
            creatorId: saveGeneratedCode._id,
            qrCode: dataURL,
            secret: secret,
        })
    });

    let session;
    try {
        session = mongoose.StartSession()
        await session.StartTransaction()
        await session.commitTransaction()
        saveTwoFactorAuthenticator.save({session})
                // .then((savedUser) => {
                //     console.log("User saved successfully:", savedUser);
                // })
                // .catch((err) => {
                //     console.error("Error saving user:", err);
                // });
        saveGeneratedCode.twoFactorAuthenticator.push(saveTwoFactorAuthenticator)
        saveGeneratedCode.save({session});
        return res.status(200).json({ secret: secret.base32, qrCode: dataURL });
    } catch(err) {
        return res.status(500).json("Failed to stored 2MFA");
    }
    
}


exports.sendCode = async (req, res) => {
    const { code, userId } = req.body;

    let data;
    try {
        data = await User.findById({ _id: userId }).populate("TwoFactorAuthenticator");
    } catch(err) {
        return res.status(500).json("error occur");
    }

    if(!data) {
        return res.status(404).json("not found")
    }

    // data.TwoFactorAuthenticator.push(code)
    return res.status(200).json("code added successfully");
}
 
