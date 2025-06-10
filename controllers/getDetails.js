import { startSession } from "mongoose"

import User from "../models/user.js"
import MessageModel from "../models/message.js"
import { getIo } from "../socket.io.js"


export const getUser = async (req, res) => {
    const id  = req.params.userId
    if(id !== req.userId.id) {
        return res.status(400).json("You can't access this route")
    }

    try {
        const user = await User.findById({ _id: req.userId.id }).select("-password")
        if(!user) {
            return res.status(404).json("Not found")
        }
 
        return res.status(200).json(user)
    } catch(err) {
        return res.status(500).json("Server error")
    }
}

export const getRegisteredUsers = async (req, res) => {
    const userId = req.userId.id
    const id = req.params.id
    if(!userId) return res.status(404).json("Id not found")

    try {
        const [ users, userData ] = await Promise.all([
            User.find().select("-password"),
            User.findById(userId).select("-password")
        ])

        if(!users && !userData) {
            return res.status(404).json("Users not found")
        }

        if(userId !== id) return res.status(400).json("You can't access this route")

        const user = users.filter(user => user._id.toString() !== userId)
        if(userData.blockUser.length === 0) {
            return res.status(200).json(user)
        }

        let filteredUser;
        for(const b of userData.blockUser) {
            filteredUser = user.filter(u => u._id !== b.id.toString() && u.fullname !== b.fullname)
        }
        return res.status(200).json(filteredUser)
    } catch(err) {
        res.status(500).json("error occur")
    }
}

export const updateProfile = async (req, res) => {
    const userId = req.userId.id
    const file = req.file
    if(!userId) return res.status(404).json("Invalid info")
    if(file === undefined) return res.status(404).json("Invalid file passed.")
    
    try {
        const userDetails = await User.findById({ _id: userId })
        if(!userDetails) return res.status(404).json("User not found")
        userDetails.profile = req.file.filename
        await userDetails.save()
        
        return res.status(200).json("Uploaded")
    } catch(err) {
        res.status(500).json("error occur")
    }
}


export const blockUser = async (req, res) => {
    const { blockUserId } = req.params
    if(!req.userId.id) return res.status(404).json("Id not found")
    
    try {
        const [user, block] = await Promise.all([
            User.findById(req.userId.id).select("-password"),
            User.findById(blockUserId).select("-password")
        ])
        if(!user && !block) {
            return res.status(404).json("User not found.")
        }
        const blockedUserDetails = {
            fullname: block.fullname,
            id: block._id,
            profile: block.profile
        }
        user.blockUser.push(blockedUserDetails)
        await user.save()
        return res.status(200).json(`${block.fullname} was blocked successfully.`)
    } catch(err) {
        return res.status(500).json("Internal Server Error.")
    }
}

export const clearAllExistingChat = async (req, res) => {
    const { chatUserId } = req.params
    if(!req.userId.id) return res.status(404).json("Id not found")

    let user;
    let chatData;
    try {
        const [userData, chatUserData] = await Promise.all([
            User.findById(req.userId.id).select("-password").populate("messages"),
            User.findById(chatUserId).select("-password").populate("messages")
        ])

        if(!userData && !chatUserData) {
            return res.status(404).json("User not found.")
        }
        user = userData;
        chatData = chatUserData;
    } catch(err) {
        return res.status(500).json("Error occurred.")
    }
    const session = await startSession()
    try {
        const conversation = await MessageModel.findOne({
            $or: [
                { creatorId: user._id, receiverId: chatData._id },
                { creatorId: chatData._id, receiverId: user._id }
            ]
        })
        session.startTransaction()
        if(user.messages.length === 0 && chatData.messages.length !== 0 
            || user.messages.length !== 0 && chatData.messages.length === 0 ) {
                if(user.messages.length === 0 && chatData.messages.length === 0) {
                    await session.abortTransaction()
                    await session.endSession()
                    return res.status(400).json("You don't have any existing message with this user.")
                }
                if(user.messages.length !== 0) {
                    user.messages.pull(conversation._id)
                    await user.save({session})
                    await conversation.deleteOne(conversation._id).session(session)
                    await session.commitTransaction()
                    return res.status(200).json("Conversations deleted.")
                } else if(chatData.messages.length !== 0) {
                    chatData.messages.pull(conversation._id)
                    await chatData.save({session})
                    await conversation.deleteOne(conversation._id).session(session)
                    await session.commitTransaction()
                    return res.status(200).json("Conversations deleted.")
                }
            }
            res.status(404).json("Sorry you can't access this route at the moment.")
    } catch(err) {
        await session.abortTransaction()
        await session.endSession()
        console.log(err.message)
        return res.status(500).json("Error Occurred On Server.")
    }
}


export const deleteSingleExistingChat = async (req, res) => {
    const { chatUserId, messageId } = req.params
    if(!req.userId.id) return res.status(404).json("Id not found")

    let user;
    let chatData;
    try {
        const [userData, chatUserData] = await Promise.all([
            User.findById(req.userId.id).select("-password"),
            User.findById(chatUserId).select("-password")
        ])

        if(!userData && !chatUserData) {
            return res.status(404).json("User not found.")
        }
        user = userData;
        chatData = chatUserData;
    } catch(err) {
        return res.status(500).json("Error occurred.")
    }

    try {
        const conversation = await MessageModel.findOne({
            $or: [
                { creatorId: user._id, receiverId: chatData._id },
                { creatorId: chatData._id, receiverId: user._id }
            ]
        })
        if(!conversation) return res.status(404).json("No conversation between users.")
        const filteredMessage = conversation.conversation.filter(
            chat => chat.senderId.toString() === req.userId.id && chat.id === messageId
        )
        if(filteredMessage.length === 0) {
            return res.status(400).json("You can't delete this message.")
        }
        conversation.conversation = conversation.conversation.filter(m => m.id !== messageId.toString())
        getIo().emit("deletedMessage", {
            action: { id: user._id }, 
            message: "Message deleted." 
        })
        await conversation.save()
        return res.status(200).json("Message deleted.")
    } catch(err) {
        return res.status(500).json("Error Occurred On Server.")
    }
}