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

import authMiddleware from '../../middleware/authHandler';

const authRoute = express.Router();

authRoute.post('/register', validateRequest(registerValidationSchema), registerUser);
authRoute.post('/verify/:userId', validateRequest(emailVerificationSchema), verifyUserToken);
authRoute.post('/login', validateRequest(loginValidationSchema), loginUser);
authRoute.post('/logout', validateRequest(logoutValidationSchema), logoutUser);
authRoute.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', authMiddleware, validateRequest(resetPasswordSchema), resetPassword);

export default authRoute;
