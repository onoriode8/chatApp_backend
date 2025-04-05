import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    email: { type: String, trim: true, required: true },
    password: { type: String, trim: true, required: true},
    fullname: { type: String, trim: true, required: true},
    profile: { type: String, trim: true, required: true},
    messages: [ { type: mongoose.Schema.Types.ObjectId, ref: ""} ]
})

const userModel = new mongoose.model("Users", userSchema)

export default userModel;