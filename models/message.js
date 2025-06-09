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
        {
            id: { type: String, required: true, trim: true },
            message: { type: String, required: true, trim: true }, 
            senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
            createdAt: { type: Date, required: true, trim: true },
            time: { type: String, required: true, trim: true }
        }
    ]
})

const messageModel = mongoose.model("Conversations", messageSchema)

export default messageModel;