"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validationHandler_1 = require("../../middleware/validationHandler");
const userValidation_1 = require("../../validation/userValidation");
const authControllers_1 = require("../../controllers/authControllers");
const authRoute = express_1.default.Router();
authRoute.post('/register', (0, validationHandler_1.validateRequest)(userValidation_1.registerValidationSchema), authControllers_1.registerUser);
authRoute.post('/verify/:userId', (0, validationHandler_1.validateRequest)(userValidation_1.emailVerificationSchema), authControllers_1.verifyUserToken);
authRoute.post('/login', (0, validationHandler_1.validateRequest)(userValidation_1.loginValidationSchema), authControllers_1.loginUser);
authRoute.post('/logout', (0, validationHandler_1.validateRequest)(userValidation_1.logoutValidationSchema), authControllers_1.logoutUser);
authRoute.post('/forgot-password', (0, validationHandler_1.validateRequest)(userValidation_1.forgotPasswordSchema), authControllers_1.forgotPassword);
authRoute.post('/reset-password', (0, validationHandler_1.validateRequest)(userValidation_1.resetPasswordSchema), authControllers_1.resetPassword);
authRoute.post('/refresh-token', (0, validationHandler_1.validateRequest)(userValidation_1.requestAccessTokenSchema), authControllers_1.requestAccessToken);
exports.default = authRoute;
