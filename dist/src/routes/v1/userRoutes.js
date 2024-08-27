"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authHandler_1 = __importDefault(require("../../middleware/authHandler"));
const userControllers_1 = require("../../controllers/userControllers");
const validationHandler_1 = require("../../middleware/validationHandler");
const userValidation_1 = require("../../validation/userValidation");
const userRoute = express_1.default.Router();
userRoute.get('/', authHandler_1.default, userControllers_1.fetchUser);
userRoute.put('/:userId', authHandler_1.default, userControllers_1.updateUser);
userRoute.post('/update-email/:userId', authHandler_1.default, (0, validationHandler_1.validateRequest)(userValidation_1.forgotPasswordSchema), userControllers_1.changeUserEmail);
userRoute.put('/verify-email/:userId', authHandler_1.default, (0, validationHandler_1.validateRequest)(userValidation_1.emailVerificationSchema), userControllers_1.verifyEmail);
userRoute.put('/change-password/:userId', authHandler_1.default, (0, validationHandler_1.validateRequest)(userValidation_1.updatePasswordSchema), userControllers_1.changePassword);
userRoute.delete('/delete-account/:userId', authHandler_1.default, userControllers_1.deleteUser);
exports.default = userRoute;
