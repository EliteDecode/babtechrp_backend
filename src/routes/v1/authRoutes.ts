import express from 'express';
import { validateRequest } from '../../middleware/validationHandler';
import {
	emailVerificationSchema,
	forgotPasswordSchema,
	loginValidationSchema,
	logoutValidationSchema,
	registerValidationSchema,
	resetPasswordSchema
} from '../../validation/userValidation';
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyUserToken } from '../../controllers/authControllers';
import { reset_password } from '../../services/authServices';
import authMiddleware from '../../middleware/authHandler';

const authRoute = express.Router();

authRoute.post('/register', validateRequest(registerValidationSchema), registerUser);
authRoute.post('/verify', validateRequest(emailVerificationSchema), verifyUserToken);
authRoute.post('/login', validateRequest(loginValidationSchema), loginUser);
authRoute.post('/logout', validateRequest(logoutValidationSchema), logoutUser);
authRoute.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', validateRequest(resetPasswordSchema), authMiddleware, resetPassword);

export default authRoute;
