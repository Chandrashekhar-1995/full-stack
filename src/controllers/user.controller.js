import User from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// Register user
const register = asyncHandler( async (req, res) =>{


    
    // throw new ApiError(400, "Email or mobile number already exists.")
    res.status(201).json(
        new ApiResponse(
            201,
            {},
            "User registered successfully."
        )
    )
} );

export {
    register,
}