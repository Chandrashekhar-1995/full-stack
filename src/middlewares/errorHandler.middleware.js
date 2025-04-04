import { ApiResponse } from "../utils/api-response.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Send a consistent error response
    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            null,
            message
        )
    );
};

export { errorHandler};