import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

// this is to communicate with the backend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    // this credentials true means it allows cookies, auth headers or TLS client certificate to be sent from frontend
    // this is needed when both frontend and backend are on different ports
    credentials: true
}))
// Allows backend to read req.body in JSON form safely. Prevents via huge JSON payloads.
app.use(express.json({limit: "20kb"}))
//Useful if you're accepting data from HTML forms or some external services
app.use(express.urlencoded({extended: true, limit: "20kb"}))
//So if you have a file at public/logo.png, it will be accessible at http://yourdomain.com/logo.png
app.use(express.static("public"))
//Required for reading cookies (like tokens or session data) in secure user authentication systems
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'


// routes declaration
// route is used because router is written so middleware is used
app.use('/api/v1/users',userRouter)
export {app}