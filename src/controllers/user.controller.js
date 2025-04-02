import crypto from "crypto";
import { asyncHandler } from "../utils/async-handler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import sendVerificationEmail from "../utils/sendMail.js";
import { log } from "console";

// Register user
const register = asyncHandler( async (req, res, next) =>{
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required.")
    };

    if (password.length < 6) {
        throw new ApiError(400, "Password must me 6 char")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format.");
    }

    try {
        // Check for duplicate email or mobile number
        const existingUser = await User.findOne({email})
        if (existingUser) {
            throw new ApiError(400, "Email already registered, please login.")
        };

        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + (10 * 60 * 60 * 1000);

        // Create new user
        const user = new User({
            name,
            email,
            password,
            verificationToken:token,
            verificationTokenExpiry:tokenExpiry
            });
        await user.save();

        const createdUser = await User.findById(user._id).select(
            "-password"
        );

        // await sendVerificationEmail(user.email, token);
        
    
        res.status(201).json(
            new ApiResponse(
                201,
                createdUser,
                "User registered successfully. Please check your email."
            )
        )
    } catch (err) {
        next(err)
    }
} );

const verify = asyncHandler( async (req, res, next) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({
            verificationToken:token,
            verificationTokenExpiry:{$gt:Date.now()}
        });

        if (!user) {
            throw new ApiError(400, "token invalid" )
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(201).json(
            new ApiResponse(
                200,
                user,
                "User verification successfull."
            )
        )
    } catch (error) {
        next(error)
    }

});

const login = asyncHandler( async (req, res, next) => {
    try {
    const {email, password} = req.body;

    if ( !email || !password) {
        throw new ApiError(400, "All fields are required.")
    };

        const user = await User.findOne({
            email
        });

        if (!user) {
            throw new ApiError(400, "Email not registered" )
        };
    
        // Validate password using the schema method
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials.");
        }

        // Generate JWT token using the user/customer model's method
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save()

        res.cookie("accessToken", accessToken)
        res.cookie("refreshToken", refreshToken)
        res.status(200).json(
            new ApiResponse(
                200,
                user,
                "Login successfull."
            )
        )
    } catch (error) {
        next(error)
    }

});

const getProfile = asyncHandler(async (req, res, next) => {

    try {
        const userId = req.user.id
        // Respond with the profile details
        const user = await User.findById(userId).select("-password");
        res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully."));
    } catch (err) {
        next(err);
    }
})

export {
    register,
    verify,
    login, 
    getProfile,
}