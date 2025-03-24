import { validationResult } from 'express-validator'
import bcryptjs from 'bcryptjs'

import User from '../models/user.js'
import JsonWebToken from 'jsonwebtoken'


export const signup = async (req, res) => {
    const { email, password } = req.body
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.path} is ${error.msg}`)
        }
    }

    try {
        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.status(400).json(`${existingUser.email} already exist, try again.`)
        }
        const hashedPassword = await bcryptjs.hash(password, 12)
        const createdUser = new User({
            email: email,
            password: hashedPassword,
            messages: []
        })

        const user = await createdUser.save()
        const token = JsonWebToken.sign(
            { id: user._id, email: user.email },
             process.env.SECRET_TOKEN, {expiresIn: "1h"})

        return res.status(201).json({ id: user._id, token })
    } catch(err) {
        return res.status(500).json("Server is down")
    }

}