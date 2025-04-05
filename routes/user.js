import express from 'express'
import { body, check } from 'express-validator'


import upload from '../middleware/file-upload.js'
import { signup, signin } from '../controllers/auth.js'
import { getUser, updateProfile, getRegisteredUsers } from '../controllers/getDetails.js'
import AuthorizationMiddleware from "../middleware/auth.js"


const router = express.Router()

//signup new user /user/signup  //passed
router.post("/signup", upload.single("userProfile"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }), signup)

//router to login /user/signin //passed
router.post("/signin", 
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }), signin)

//router to get user /user/user/:userId //passed
router.get("/user/:userId", 
    AuthorizationMiddleware, getUser) 

//router to get all registered users /user/users/:id
router.get("/users/:id", 
    AuthorizationMiddleware,
    getRegisteredUsers)

//router to update new photo
router.patch("/user/update/profile", AuthorizationMiddleware,
    upload.single("updateProfile"), updateProfile)

export default router;