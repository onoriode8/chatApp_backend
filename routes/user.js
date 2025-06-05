import express from 'express'
import { body, check } from 'express-validator'


import upload from '../middleware/file-upload.js'
import { signup, signin } from '../controllers/auth.js'
import { getUser, updateProfile, getRegisteredUsers, blockUser } from '../controllers/getDetails.js'
import { getConversations, sendMessage } from '../controllers/message.js'
import AuthorizationMiddleware from "../middleware/auth.js"


const router = express.Router()

//signup new user /user/signup
router.post("/signup", upload.single("userProfile"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }), signup)

//router to login /user/signin
router.post("/signin", 
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }), signin)

//router to get user /user/user/:userId
router.get("/user/:userId", 
    AuthorizationMiddleware, getUser) 

//router to get all registered users /user/users/:id
router.get("/users/:id", 
    AuthorizationMiddleware,
    getRegisteredUsers) // => filtered out Blocked users.

//router to update new photo
router.patch("/user/update/profile", AuthorizationMiddleware,
    upload.single("updateProfile"), updateProfile)

//router to get server message from sender & receiver.
//route is /user/get/server/message
router.get("/get/server/message/:creatorId/:receiverId",
    AuthorizationMiddleware, getConversations)


//router to send message to server
//route is /user/send/message
router.patch("/send/message/:creatorId/:receiverId", 
    AuthorizationMiddleware, check("message"), sendMessage)

//router to block user. => /user/block/:blockUserId
router.get("/block/:blockUserId", AuthorizationMiddleware, blockUser)

export default router;