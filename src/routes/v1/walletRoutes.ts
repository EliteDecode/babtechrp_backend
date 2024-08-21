import express from 'express';
import { fetchUserWallet } from '../../controllers/walletControllers';
import authMiddleware from '../../middleware/authHandler';

export const walletRoute = express.Router();

walletRoute.get('/', authMiddleware, fetchUserWallet);
