import User from "../models/user.js"

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
        const users = await User.find().select("-password")
        if(!users) return res.status(404).json("Users not found")
        if(userId !== id) return res.status(400).json("You can't access this route")

        const user = users.filter(user => user._id.toString() !== userId)
        return res.status(200).json(user)
    } catch(err) {
        res.status(500).json("error occur")
    }
}

export const updateProfile = async (req, res) => {
    const userId = req.userId.id
    const file = req.file
    console.log(req.file)
    if(!userId && !file) return res.status(404).json("Invalid info")
    
    try {
        const userDetails = await User.findById({ _id: userId })
        if(!userDetails) return res.status(404).json("User not found")
        userDetails.profile = req.file.path
        await userDetails.save()
        console.log("updateProfile")
        
        return res.status(200).json("Uploaded")
    } catch(err) {
        res.status(500).json("error occur")
    }
}