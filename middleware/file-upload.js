import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const fileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split("/")[1];
            if(!extension) {
                const error = new Error("File not supported.")
                return cb(error, false)
            }
            const fileName = uuidv4() + "." + extension;
            cb(null, fileName)
        }
    }),
    fileFilter: (req, file, cb) => {
        const MIME_TYPE_MAP = file.mimetype;
        const jpeg = MIME_TYPE_MAP === "image/jpeg"
        const jpg = MIME_TYPE_MAP === "image/jpg"
        const png = MIME_TYPE_MAP === "image/png"
        const svg = MIME_TYPE_MAP === "image/svg"
        if(jpeg || jpg || png || svg) {
            cb(null, true)
        } else {
            cb(new Error("Invalid file extension sent."), false)
        }
    }
})

export default fileUpload;