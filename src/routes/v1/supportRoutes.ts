import express from 'express';
import { validateRequest } from '../../middleware/validationHandler';
import { sendMessageSchema } from '../../validation/supportValidation';
import authMiddleware from '../../middleware/authHandler';
import { sendMessage } from '../../controllers/supportController';

export const supportRoute = express.Router();

supportRoute.post('/send-message', validateRequest(sendMessageSchema), authMiddleware, sendMessage);

//Admin Wallet
