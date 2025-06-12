import express from 'express'
import { body, check } from 'express-validator'


import upload from '../middleware/cloudinary.js'
import { signup, signin } from '../controllers/auth.js'
import { getUser, updateProfile, 
    getRegisteredUsers, blockUser, deleteSingleExistingChat,
    clearAllExistingChat } from '../controllers/getDetails.js'
import { getConversations, sendMessage, sendFileHandler } from '../controllers/message.js'
import AuthorizationMiddleware from "../middleware/auth.js"
import expressRateLimit from '../middleware/rate-limit.js'


const router = express.Router()

router.post("/signup", expressRateLimit, upload.single("userProfile"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }), signup)

router.post("/signin", expressRateLimit,
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }), signin)

router.get("/user/:userId", AuthorizationMiddleware, getUser) 

router.get("/users/:id", AuthorizationMiddleware, getRegisteredUsers)

router.patch("/user/update/profile", expressRateLimit, AuthorizationMiddleware,
    upload.single("updateProfile"),  updateProfile)

router.get("/get/server/message/:creatorId/:receiverId",
    AuthorizationMiddleware, getConversations)

router.patch("/send/message/:creatorId/:receiverId", upload.single("sendImage"),
    AuthorizationMiddleware, check("message"), sendMessage)

router.patch("/api/send/image/:creatorId/:receiverId", upload.single("sendFile"),
    AuthorizationMiddleware, sendFileHandler)

router.get("/block/:blockUserId", AuthorizationMiddleware, blockUser)

router.delete("/delete/:chatUserId", AuthorizationMiddleware, clearAllExistingChat) 

router.delete("/single/chat/delete/:chatUserId/:messageId", 
    AuthorizationMiddleware, deleteSingleExistingChat) 

    
export default router;