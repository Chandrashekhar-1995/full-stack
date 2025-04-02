import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import User from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    try {
        if (!accessToken) {
            if (!refreshToken) {
                throw new ApiError(401, "Please login to continue");
            }

            // Verify Refresh Token
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

            // Set new tokens in cookies
            res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true });
            res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });

            req.user = { id: user._id };
            return next();
        }

        // Try verifying access token
        try {
            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken.id);

            if (!user) {
                throw new ApiError(401, "User not found, please login again.");
            }

            req.user = { id: user._id };
            return next();
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                // Access token expired, verify refresh token
                if (!refreshToken) {
                    throw new ApiError(401, "Session expired, please login again.");
                }

                const refreshDecodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(refreshDecodedToken.id);

                if (!user || user.refreshToken !== refreshToken) {
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    throw new ApiError(401, "Invalid session, please login again.");
                }

                // Generate new tokens
                const newAccessToken = user.generateAccessToken();
                const newRefreshToken = user.generateRefreshToken();

                user.refreshToken = newRefreshToken;
                await user.save();

                // Set new tokens in cookies
                res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true });
                res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });

                req.user = { id: user._id };
                return next();
            } else {
                throw new ApiError(401, "Invalid token, please login again.");
            }
        }
    } catch (err) {
        next(err);
    }
};

export { isLoggedIn };
