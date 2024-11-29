const express = require("express");
const { body } = require("express-validator")

const authentication = require("../controllers/userController/authentication");
const transfer = require("../controllers/userController/transfer");
const getUserDetails = require("../controllers/userController/getUserDetails");

// const resetPasswordController = require("../controllers/userController/reset-password");

 
const router = express.Router();
 
router.post("/signin", body("username"),
body("password").isLength({ min: 6 }), authentication.login);  //passed done with this REST API 

router.post("/signup", body("email").isEmail().normalizeEmail(),
      body("password").isLength({ min: 6 }), body("phoneNumber"),
      body("username"), authentication.signup);  //passed done with this REST API 


//routes to transfer funds to other users on Baseday.
router.patch("/transfer-fund", body("walletNumber"), body("fullname"), transfer.transferFund);


//routes to fetch user details if the UI is refreshed.
router.get("/user/:id", getUserDetails.getUser);


//routes to fetch user transaction history with userId.
router.get("/transaction_history/:id", getUserDetails.transactionHistory);


//routes to get user wallet Number.
router.get("/get_wallet/:recipientWalletNumber", getUserDetails.getWalletNumber);


//routes to edit user information and delete user account permanently.

//reset pass logic below
//router.post("/resetPassword/getCode", resetPasswordController.getCode);  // is a put() not a post request change later

//router.post("/:user/change_password", resetPasswordController.changePassword);

//watch out for this route. if it will ever reach.
//router.post("/:username/password_reset", resetPasswordController.sendCode);

module.exports = router;
