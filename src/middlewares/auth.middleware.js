import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import User from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken && !refreshToken) {
            throw new ApiError(401, "Please login to continue");
        }

        if (accessToken) {
            try {
                const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                
                // Verify user exists
                const user = await User.findById(decodedToken._id);
                if (!user) {
                    // Clear invalid tokens
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    throw new ApiError(401, "User not found, please login again.");
                }

                const newAccessToken = user.generateAccessToken();
                const newRefreshToken = user.generateRefreshToken();
                user.refreshToken = newRefreshToken;
                await user.save();

                cookieOptions = {
                    httpOnly:true,
                };

                res.cookie("accessToken", newAccessToken, cookieOptions);
                res.cookie("refreshToken", newRefreshToken, cookieOptions);
                req.user = decodedToken;
                return next();
            } catch (accessError) {
                // Access token verification failed (expired or invalid)
                if (accessError instanceof jwt.TokenExpiredError) {
                    if (!refreshToken) {
                        throw new ApiError(401, "Session expired, please login again");
                    }
                } else {
                    // Invalid access token (not just expired)
                    res.clearCookie("accessToken");
                    throw new ApiError(401, "Invalid access token");
                }
            }
        }

        // Scenario 3: Need to use refresh token (either no access token or it expired)
        if (refreshToken) {
            try {
                // Verify refresh token
                const refreshDecodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                
                const user = await User.findById(refreshDecodedToken.id);
                if (!user || user.refreshToken !== refreshToken) {
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    throw new ApiError(401, "Invalid session, please login again");
                }

                // Generate new tokens
                const newAccessToken = user.generateAccessToken();
                const newRefreshToken = user.generateRefreshToken();

                user.refreshToken = newRefreshToken;
                await user.save();

                const cookieOptions = {
                    httpOnly: true,
                };

                // Set new cookies
                res.cookie("accessToken", newAccessToken, cookieOptions);
                res.cookie("refreshToken", newRefreshToken, cookieOptions);

                // Attach user to request
                req.user = refreshDecodedToken;
                return next();
            } catch (refreshError) {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                
                if (refreshError instanceof jwt.TokenExpiredError) {
                    throw new ApiError(401, "Session expired, please login again");
                }
                throw new ApiError(401, "Invalid session, please login again");
            }
        }

        // If we get here, no valid tokens were found
        throw new ApiError(401, "Please login to continue");
    } catch (error) {
        next(error);
    }
};

export { isLoggedIn };

