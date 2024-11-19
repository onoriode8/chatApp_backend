const User = require("../../models/user/user");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require("uuid");


// let storedEmail = {}; 
exports.signup = async (req, res, next) => {
    const { email, username, password } = req.body;

    const errors = validationResult(req); //used to validate the incoming request inside the body.
    if(!errors.isEmpty()) {
        return res.status(402).json("Please enter a valid credentials");
    }

    console.log("validate result", errors);

    let existUser; 
    try {
        existUser = await User.findOne({email: email});
        console.log("exist details", existUser)
    } catch(err) { 
        return res.status(500).json("server not responding") 
    };

    if(existUser) return res.status(406).json(`user with ${existUser.email} already exist, login instead`)
 
    //generate Random OTP in string and convert down to floating point Number. 
    const generateRandomCodeInString = Math.random() * 2;
    const parsedToFixedLength = generateRandomCodeInString.toFixed(4);
    const formatted = parsedToFixedLength.replace(/[^0-9.-]+/g, "");
    const generatedToNumber = parseFloat(formatted);

    //encrypting the incoming password and generated OTP before storing on DB.
    let hashedPassword;
    try {
        hashedPassword = await bcryptjs.hash(password, 12); 
        console.log("password Hashed", hashedPassword)
    } catch(err) {
        return res.status(500).json("server error"); 
    }; 

    let hashedOTP;
    try {
        hashedOTP = await bcryptjs.hash(generatedNumber, 12);
        console.log("otp hashed", hashedOTP);
    } catch(err) {
        return res.status(400).json("failed to register, try again");
    }

    let date = new Date();
    let userFullname = email.split("@")[0];

    //generating a new UNIQUE WALLET NUMBER for new user to accept payment.
    const generatedCharacter = uuidv4();
    const formattedToWalletNumber = generatedCharacter.replace(/\D/g, "");
    const sliceToWalletNumber = Number(formattedToWalletNumber.slice(0, 10));

    //creating a signup model for new users.
    const createdUser = new User({
        email: email, 
        username: username,
        password: hashedPassword,
        balance: 0.00, //default account balance once register for the first time.
        fullname: userFullname,
        walletNumber: sliceToWalletNumber,
        friendsref: [],
        transactionHistory: [],
        image: [],
        OTP: hashedOTP,
        signupDate: date.toDateString()
    });

    //stopped programming from here.

    let token;
    try { 
        token = jwt.sign({ email, username }, 
            process.env.SECRET_TOKEN, {expiresIn: "1h"} );
        console.log("LINE 74. TOKEN RESPONSE", token);
        if(token === undefined) {
            throw new Error("failed to create web token");
        }
    } catch(err) {
        return res.status(500).json("server error, try again");  
    };

    if(!token) {
        return res.status(500).json("server error, token is empty");
    } 
    return;
    let saveUser;
    try {
        saveUser = await createdUser.save()
    } catch(err) {
        return res.status(500).json("Failed to create an account with your credentials");
    };

    if(!saveUser) return res.status(500).json("Failed to create user")

    // let session;
        //session = await mongoose.startSession();
        //await session.startTransaction();
    let mailTransporter = nodemailer.createTransport({
        service: process.env.GOOGLE_SERVICE,
        auth: {
            type: process.env.GOOGLE_CLOUD_OAUTH,
            user: process.env.GOOGLE_CLOUD_USER,
            pass: process.env.GOOGLE_CLOUD_PASSWORD,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SCECRET,
            refreshToken: process.env.REFRESH_TOKEN
        }
    });

    let mailOptions = {
        from: process.env.GOOGLE_CLOUD_USER,
        to: saveUser.email,
        subject: 'Account created was successfull',
        text: `Welcome ${saveUser.email}. You just signup to onlineBanking`,
        html: '<b>Banking<b>'
      };

    try {
      await mailTransporter.sendMail(mailOptions, function(err, data){
        if (err) {
           //return res.status(502).json(err);
           console.log(err.message)
        } 
        console.log("sendMail Data line 97", data);
      });
    } catch(err) {
        return res.status(500).json(err.message);
    }

    res.status(200).json({email: saveUser.email, id: saveUser._id,
         username: saveUser.username, token: token, image: saveUser.image});
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
       return res.status(403).json("Please enter valid data");
    }

    let existEmail;
    try {
        existEmail = await User.findOne({email: email});
    } catch(err) {
        return res.status(500).json("Server error");
    };


    if(existEmail === null || undefined) {
        return res.status(422).json("User not found, create an account instead");
    }

    let hashPassword;
    try {
        hashPassword = await bcryptjs.compare(password, existEmail.password);
    } catch(err) {
        return res.status(500).json("Failed");
    };

    if(!hashPassword) {
        return res.status(403).json("wrong password, try again");
    };

    let token;
    try {
        token = jwt.sign({ userId: existEmail._id, email: existEmail.email},
            process.env.SECRET_TOKEN, { expiresIn: "1h" });
    } catch(err) {
        return res.status(500).json("Failed to create token");
    };

    return res.status(200).json({
        email: existEmail.email, id: existEmail._id, 
        username: existEmail.username, token: token, image: existEmail.image});
};