// The ApiResponse class creates a consistent response structure for every API call — success 
class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}