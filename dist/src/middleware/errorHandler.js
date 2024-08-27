"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        error: {
            message: statusCode === 500 ? 'Internal Server Error' : statusCode === 404 ? 'Route Not Found' : err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        }
    });
}
