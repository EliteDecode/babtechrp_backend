import express from 'express';
import { fetchUserWithdrawals, requestWithdrawal } from '../../controllers/withdrawalControllers';
import authMiddleware from '../../middleware/authHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { requestWithdrawalSchema } from '../../validation/withdrawalValidation';

export const withdrawalRoute = express.Router();

withdrawalRoute.get('/', authMiddleware, fetchUserWithdrawals);
withdrawalRoute.post('/request-withdrawal', authMiddleware, validateRequest(requestWithdrawalSchema), requestWithdrawal);

//Admin Wallet
