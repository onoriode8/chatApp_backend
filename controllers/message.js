import { validationResult } from 'express-validator'

import Message from '../models/message.js'
import UserModel from '../models/user.js'

export const getConversations = async (req, res) => {
    const userId = req.userId.id

    try {
        const user = await UserModel.findById({ _id: userId })
        .populate("Conversations")
        if(!user) return res.status(404).json("Conversation not found!")
        if(user._id !== userId) {
            return res.status(400).json("You are not allowed on this routes.")
        }

        console.log("USER FROM GETTING CONVERSATION", user)

        return res.status(200).json(user.Conversations)
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }

}


export const sendMessage = (req, res) => {
    const { message } = req.body
    const userId = req.userId.id

    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.path} is ${error.msg}`)
        }
    }

    

}