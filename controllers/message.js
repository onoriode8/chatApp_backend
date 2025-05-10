import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid'
import { getIo, getSocketClientId } from '../socket.io.js';


import Message from "../models/message.js";
import UserModel from "../models/user.js";



export const getConversations = async (req, res) => {
  const userId = req.userId.id;
  const creatorId = req.params.creatorId
  const receiverId = req.params.receiverId

  try {
    const [creatorUser, receiverUser] = await Promise.all([
        UserModel.findById(creatorId)
          .select("-password").populate("messages"),
         UserModel.findById(receiverId)
          .select("-password").populate("messages")
    ]);

    if (!creatorUser && !receiverUser) return res.status(404).json("Conversation not found!");
    if (creatorUser._id.toString() !== userId &&
        receiverId !== receiverUser._id.toString()) {
      return res.status(400).json("You are not allowed on this routes.");
    }

    if(creatorUser.messages.length === 0) {
      const conversation = await Message.findOne({ 
      $or: [ 
          { creatorId: creatorId, receiverId: receiverId },
          { creatorId: receiverId, receiverId: creatorId }
        ]
      })
      const pushArray = [];
      pushArray.push(conversation)
      // console.log("LINE 38 CONVERSATION", pushArray)
      return res.status(200).json(pushArray) 
    }
    return res.status(200).json(creatorUser.messages);//return an array of messages.
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const sendMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.userId.id;
  const { creatorId, receiverId } = req.params
    // console.log(req.body, req.params)
  const result = validationResult(req);
  if (!result.isEmpty()) {
    for (const error of result.errors) {
      return res.status(422).json(`${error.path} is ${error.msg}`);
    }
  }

  try {
    const [existingSender, existingReceiver] = await Promise.all([
        UserModel.findById(creatorId),
        UserModel.findById(receiverId)
    ])
        
    if(!existingSender && !existingReceiver) {
        return res.status(404).json("Not Found")
    }

    if(userId !== existingSender._id.toString()) {
        return res.status(400).json("You can't message this user.")
    }
    
    const conversation = await Message.findOne({
      $or: [
        { creatorId: creatorId, receiverId: receiverId },
        { creatorId: receiverId, receiverId: creatorId }
      ]
    })

    const date = new Date()
    const time = date.toString().split(" ")[4]
    
    const messagesCreated = {
      id: uuidv4(),
      message, 
      senderId: existingSender._id,
      createdAt: new Date(),
      time: time
    }

    const id = getSocketClientId()

    if(!conversation) {
      const createdConversation = new Message({
          creatorId: creatorId,  
          receiverId: receiverId,
          conversation: [messagesCreated]
      })
      
      getIo().to(id).emit("message", {
        conversation: createdConversation
      })
      await createdConversation.save()
      existingSender.messages.push(createdConversation._id)
      await existingSender.save()
      return res.status(201).json(createdConversation)
    }

    conversation.conversation.push(messagesCreated)

    //emit socket event to users.
    getIo().emit("message", {
      conversation
    })

    await conversation.save() 
    
    return res.status(201).json(conversation) 
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};