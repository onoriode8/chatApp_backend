import mongoose from 'mongoose'


const messageSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", required: true
    },
    conversation: [
        // { type: String, required: true, trim: true },
        // { 
        //     type: mongoose.Schema.Types.ObjectId, 
        //     ref: "Users"
        // }
    ]
})

const messageModel = mongoose.model("Conversations", messageSchema)

export default messageModel;