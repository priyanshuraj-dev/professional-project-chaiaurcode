// multer is node.js middleware for handling file uploads
import multer from "multer";
// it configures multer to store uploaded files on disk temporarily specially in the folder called ./public/temp
const storage = multer.diskStorage({
  // cb is callback
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage,})