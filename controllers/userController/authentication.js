const User = require("../../models/user/user");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require("uuid");


exports.signup = async (req, res, next) => {
    const { email, username, password } = req.body;

    const errors = validationResult(req); //used to validate the incoming request inside the body.
    if(!errors.isEmpty()) {
        return res.status(422).json("Please enter a valid credentials");
    }

    let existUser; 
    let existUserName;
    try {
        existUser = await User.findOne({email: email});
        existUserName = await User.findOne({ username })
    } catch(err) { 
        return res.status(500).json("server not responding") 
    };

    if(existUser) return res.status(406).json(`user with ${existUser.email} already exist, login instead`)
    if(existUserName) return res.status(406).json(`${existUserName.username} already exist`);

    //generated Random OTP in string. 
    const generateRandomCodeInString = Math.random() * 2;
    const parsedToFixedLength = generateRandomCodeInString.toFixed(4);
    const formatted = parsedToFixedLength.replace(/[^0-9.-]+/g, "");
    const generatedToNumber = formatted;

    //encrypting the incoming password and generated OTP before storing on DB.
    let hashedPassword;
    let hashedOTP;
    try {
        hashedPassword = await bcryptjs.hash(password, 12); 
        hashedOTP = await bcryptjs.hash(generatedToNumber, 12);
    } catch(err) {
        return res.status(500).json("server error"); 
    } 

    let date = new Date();
    let userFullname = email.split("@")[0];

    //generating a new UNIQUE WALLET NUMBER for new user to accept payment.
    const generatedCharacter = uuidv4();
    const formattedToWalletNumber = generatedCharacter.replace(/\D/g, "");
    const sliceToWalletNumber = Number(formattedToWalletNumber.slice(0, 10));

    const welcomeBonus = 5000;
    //creating a signup model for new users.
    const createdUser = new User({
        email: email, 
        username: username,
        password: hashedPassword,
        balance: welcomeBonus, //default account balance once register for the first time.
        fullname: userFullname,
        walletNumber: sliceToWalletNumber,
        friendsref: [],
        transactionHistory: [],
        image: [],
        notification: [],
        OTP: hashedOTP,
        signupDate: date.toDateString()
    });


    let token;
    try { 
        token = jwt.sign({ email, username }, 
            process.env.SECRET_TOKEN, {expiresIn: "1h"} );
        if(token === undefined) {
            throw new Error("failed to create web token");
        }
    } catch(err) {
        return res.status(500).json("server error, try again");  
    };

    if(!token || token === null) {
        return res.status(500).json("server error, token is empty");
    }

    let saveUser;
    try {
        saveUser = await createdUser.save();
    } catch(err) {
        return res.status(500).json("Failed to create an account with your credentials");
    };

    if(!saveUser) return res.status(500).json("Failed to create user");

    
    // Retrieve the IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


    //SAVE REGISTERED NOTIFICATION TO USER NOTIFICATION.
    try {
        const newlyLoggedInNotification = {
            message: "You just created an account with Baseday Online Banking",
            ip: ip,
            date: date.toDateString()
        }
        saveUser.notification.push(newlyLoggedInNotification);
        await saveUser.save();
    } catch(err) {}


    let mailTransporter = nodemailer.createTransport({
         service: process.env.GOOGLE_SERVICE,
         auth: {
            user: process.env.GOOGLE_USER,
            pass: process.env.GOOGLE_USER_PASSWORD
        }
    }); 

    let mailOptions = {
        from: process.env.GOOGLE_USER,
        to: saveUser.email,
        subject: `WELCOME ${saveUser.username} YOUR SIGIN WAS SUCCESSFUL on ${ip} ADDRESS`,
        text: `You can experience fast transaction with no fee added.`,
        html: '<b>Banking Wallet for Fast transaction and scalability.<b>'
      };

    try {
      await mailTransporter.sendMail(mailOptions, function(err, data) {
        if (err) {} 
      });
    } catch(err) {}

    return res.status(200).json({email: saveUser.email, id: saveUser._id,
         walletNumber: saveUser.walletNumber,
         username: saveUser.username, token: token, image: saveUser.image});
};

//login function for existing users with email and password for authentication.
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
       return res.status(403).json("Please enter valid data");
    }

    let existEmail;
    try {
        existEmail = await User.findOne({ email })
        // .populate(["friendsref", "image", "transactionHistory"])
    } catch(err) {
        return res.status(500).json("Server error");
    };


    if(existEmail === null || undefined) {
        return res.status(422).json("User not found, create an account instead");
    }

    let hashedPassword;
    try {
        hashedPassword = await bcryptjs.compare(password, existEmail.password);
    } catch(err) {
        return res.status(500).json("Failed"); 
    };

    if(!hashedPassword) {
        return res.status(403).json("wrong password, try again"); 
    };

    //disable/undefine the password and OTP.
    existEmail.password = undefined;
    existEmail.OTP = undefined;
    
    let token;
    try {
        token = jwt.sign({ userId: existEmail._id, email: existEmail.email},
            process.env.SECRET_TOKEN, { expiresIn: "1h" });
    } catch(err) {
        return res.status(500).json("Failed to create token");
    };

    
    //sending emails to login user and push notification to user;
    let mailTransporter = nodemailer.createTransport({
        service: process.env.GOOGLE_SERVICE,
        auth: {
           user: process.env.GOOGLE_USER,
           pass: process.env.GOOGLE_USER_PASSWORD
       }
    }); 

    let mailOptions = {
       from: process.env.GOOGLE_USER,
       to: existEmail.email,
       subject: `WELCOME ${existEmail.username} YOUR SIGIN WAS SUCCESSFUL`,
       text: `You can experience fast transaction with no fee added.`,
       html: '<b>Banking Wallet for Fast transaction and scalability.<b>'
    };

    try {
     await mailTransporter.sendMail(mailOptions, function(err, data) {
       if (err) {} 
     });
    } catch(err) {}

    return res.status(200).json({
        // email: existEmail.email, id: existEmail._id, 
        // username: existEmail.username, token: token, image: existEmail.image,
        // notification: existEmail.notification, 
        // transactionHistory: existEmail.transactionHistory,
        // friendsRef: existEmail.friendsref
        existEmail, token: token
    });
}; 