"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
const generateResetToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};
const refreshTokens = (refreshToken) => {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return generateTokens({ _id: decoded.id });
};
const generateAdminTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ADMIN_REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};
const verifyAdminToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);
};
const verifyAdminRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ADMIN_REFRESH_TOKEN_SECRET);
};
exports.default = {
    generateTokens,
    verifyToken,
    refreshTokens,
    generateResetToken,
    generateAdminTokens,
    verifyAdminToken,
    verifyRefreshToken,
    verifyAdminRefreshToken
};
