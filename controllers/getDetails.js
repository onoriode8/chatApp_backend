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
        const [ users, userData ] = await Promise.all([
            User.find().select("-password"),
            User.findById(userId).select("-password")
        ])

        if(!users && !userData) {
            return res.status(404).json("Users not found")
        }

        if(userId !== id) return res.status(400).json("You can't access this route")

        const user = users.filter(user => user._id.toString() !== userId)
        // user.filter(u => u._id !== )
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