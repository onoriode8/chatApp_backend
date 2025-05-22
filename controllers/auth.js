import { validationResult } from 'express-validator'
import bcryptjs from 'bcryptjs'
import JsonWebToken from 'jsonwebtoken'
import fs from 'fs'

import User from '../models/user.js'


export const signup = async (req, res) => {
    const { email, password } = req.body

    email.toLowerCase()
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            // fs.unlink(req.file.path, (err) => {
            //     if(err) {
            //         throw new Error(err)
            //     }
            // })

            return res.status(422).json(`${error.path} is ${error.msg}`)
        }
    }

    try {
        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.status(400).json(`${existingUser.email} already exist, try again.`)
        }
        const fullname = email.split("@")[0]
        const hashedPassword = await bcryptjs.hash(password, 12)
        if(!req.file.path) return res.status(404).json("File is empty.")
        const createdUser = new User({
            email: email,
            password: hashedPassword,
            fullname,
            profile: process.env.FRONTEND_PORT + req.file.path,
            messages: []
        })

        const user = await createdUser.save()

        const token = JsonWebToken.sign(
            { id: user._id, email: user.email },
             process.env.SECRET_TOKEN, {expiresIn: "1h"})
        // fs.unlink(req.file.path, (err) => {
        //     if(err) {
        //         throw new Error(err)
        //     }
        // })
        if(!token) return res.status(400).json("Token is empty.")
        
        return res.status(201).json({ id: user._id, token })
    } catch(err) {
        // fs.unlink(req.file.path, (err) => {
        //     if(err) {
        //         throw new Error(err)
        //     }
        // })

        return res.status(500).json("Server is down")
    }

}

export const signin = async (req, res) => {
    const { email, password } = req.body;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.path} is ${error.msg}`)
        }
    }
    try {
        const user = await User.findOne({ email })
        if(!user) return res.status(404).json("User not found")
        const isValid = await bcryptjs.compare(password, user.password)
        if(!isValid) return res.status(401).json("Invalid credentials entered!")
        user.password = undefined;
        const token = JsonWebToken.sign(
            { email: user.email, id: user._id}, 
            process.env.SECRET_TOKEN, {expiresIn: "1hr"})
        if(!token) return res.status(401).json("Token not generated, try again.")
        return res.status(200).json({ user, token })
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
}
