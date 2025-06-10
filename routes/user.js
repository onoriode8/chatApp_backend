import express from 'express'
import { body, check } from 'express-validator'

import upload from '../middleware/file-upload.js'
import { signup, signin } from '../controllers/auth.js'
import { getUser, updateProfile, 
    getRegisteredUsers, blockUser, deleteSingleExistingChat,
    clearAllExistingChat } from '../controllers/getDetails.js'
import { getConversations, sendMessage } from '../controllers/message.js'
import AuthorizationMiddleware from "../middleware/auth.js"


const router = express.Router()


router.post("/signup", upload.single("userProfile"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }), signup)

router.post("/signin", 
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }), signin)

router.get("/user/:userId", 
    AuthorizationMiddleware, getUser) 

router.get("/users/:id", AuthorizationMiddleware, 
    getRegisteredUsers)

router.patch("/user/update/profile", AuthorizationMiddleware,
    upload.single("updateProfile"),  updateProfile) 

router.get("/get/server/message/:creatorId/:receiverId",
    AuthorizationMiddleware, getConversations)

router.patch("/send/message/:creatorId/:receiverId", 
    AuthorizationMiddleware, check("message"), sendMessage)

router.get("/block/:blockUserId", AuthorizationMiddleware, blockUser)

router.delete("/delete/:chatUserId", AuthorizationMiddleware, clearAllExistingChat) 

router.delete("/single/chat/delete/:chatUserId/:messageId", 
    AuthorizationMiddleware, deleteSingleExistingChat) 

export default router;