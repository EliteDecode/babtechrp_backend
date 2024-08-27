"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAccessToken = exports.resetPassword = exports.forgotPassword = exports.logoutUser = exports.loginUser = exports.verifyUserToken = exports.registerUser = void 0;
const handleRequest_1 = require("../helpers/handleRequest");
const authServices_1 = require("../services/authServices");
// Exporting controllers using the higher-order function
exports.registerUser = (0, handleRequest_1.handleRequest)(authServices_1.register_user);
exports.verifyUserToken = (0, handleRequest_1.handleRequest)(authServices_1.verify_user_token);
exports.loginUser = (0, handleRequest_1.handleRequest)(authServices_1.login_user);
exports.logoutUser = (0, handleRequest_1.handleRequest)(authServices_1.logout_user);
exports.forgotPassword = (0, handleRequest_1.handleRequest)(authServices_1.forgot_password);
exports.resetPassword = (0, handleRequest_1.handleRequest)(authServices_1.reset_password);
exports.requestAccessToken = (0, handleRequest_1.handleRequest)(authServices_1.get_access_token);
