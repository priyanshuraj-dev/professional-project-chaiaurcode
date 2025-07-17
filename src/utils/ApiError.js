// The ApiResponse class creates a consistent response structure for every API call — error 
class ApiError extends Error{
    constructor (
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.statck = stack
        }
        else{
            //This method tells Node.js to:
            // Record where the error occurred
            // And save that info inside the error’s .stack property

            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}