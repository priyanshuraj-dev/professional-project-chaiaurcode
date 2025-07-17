const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> next(err))
    }
}

export {asyncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (func) =>{ return async () => {} }
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) { // this below line means sending error message to the client side
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }