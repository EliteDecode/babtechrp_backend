import express from 'express';
import authMiddleware from '../../middleware/authHandler';
import { changePassword, changeUserEmail, deleteUser, fetchUser, updateUser, verifyEmail } from '../../controllers/userControllers';
import { validateRequest } from '../../middleware/validationHandler';
import { emailVerificationSchema, forgotPasswordSchema, updatePasswordSchema } from '../../validation/userValidation';

const userRoute = express.Router();

userRoute.get('/', authMiddleware, fetchUser);
userRoute.put('/:userId', authMiddleware, updateUser);
userRoute.post('/update-email/:userId', authMiddleware, validateRequest(forgotPasswordSchema), changeUserEmail);
userRoute.put('/verify-email/:userId', authMiddleware, validateRequest(emailVerificationSchema), verifyEmail);
userRoute.put('/change-password/:userId', authMiddleware, validateRequest(updatePasswordSchema), changePassword);
userRoute.delete('/delete-account/:userId', authMiddleware, deleteUser);

export default userRoute;
