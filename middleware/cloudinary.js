import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer';

import cloudinaryConfig from '../config/cloudinary.js'


const storage = new CloudinaryStorage({
    cloudinary: cloudinaryConfig,
    params: async(req, file) => ({
        folder: "uploads/images",
        format: file.mimetype.split("/")[1],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    })
})

const fileUpload = multer({ storage })


export default fileUpload;