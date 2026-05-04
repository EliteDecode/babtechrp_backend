import express from 'express';
import { validateRequest } from '../../middleware/validationHandler';
import {
	emailVerificationSchema,
	forgotPasswordSchema,
	loginValidationSchema,
	logoutValidationSchema,
	registerValidationSchema,
	requestAccessTokenSchema,
	resetPasswordSchema
} from '../../validation/userValidation';
import {
	forgotPassword,
	loginUser,
	logoutUser,
	registerUser,
	requestAccessToken,
	resendVerification,
	resetPassword,
	verifyUserToken
} from '../../controllers/authControllers';

const authRoute = express.Router();

authRoute.post('/register', validateRequest(registerValidationSchema), registerUser);
authRoute.post('/verify/:userId', validateRequest(emailVerificationSchema), verifyUserToken);
authRoute.post('/resend-verification/:userId', resendVerification);
authRoute.post('/login', validateRequest(loginValidationSchema), loginUser);
authRoute.post('/logout', validateRequest(logoutValidationSchema), logoutUser);
authRoute.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
authRoute.post('/refresh-token', validateRequest(requestAccessTokenSchema), requestAccessToken);

export default authRoute;
