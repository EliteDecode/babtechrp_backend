import express, { Request, Response } from 'express';
import { adminAuthMiddleware, subAdminAuthMiddleware } from '../../middleware/adminAuthHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { loginValidationSchema, registerValidationSchema } from '../../validation/adminValidation';
import {
	createSubAdmin,
	deleteSubAdmin,
	fetchAdmin,
	fetchAllReferrals,
	fetchAllUsers,
	fetchSingleReferral,
	fetchSingleUser,
	loginAdmin,
	logoutAdmin,
	suspendSubAdmin,
	toggleSuspendAccount,
	updateSubAdmin
} from '../../controllers/adminControllers';
import { approveWithdrawal, declineWithdrawal, fetchAllUserWithdrawals, fetchUserSingleWithdrawal } from '../../controllers/withdrawalControllers';
import { fetchAllUserWallet, fetchSingleUserWallet } from '../../controllers/walletControllers';

export const adminRoute = express.Router();

adminRoute.post('/login', validateRequest(loginValidationSchema), loginAdmin);
adminRoute.post('/register', adminAuthMiddleware, validateRequest(registerValidationSchema), createSubAdmin);
adminRoute.put('/update/:adminId', subAdminAuthMiddleware, updateSubAdmin);
adminRoute.delete('/delete/:adminId', adminAuthMiddleware, deleteSubAdmin);
adminRoute.put('/suspend/:adminId', adminAuthMiddleware, suspendSubAdmin);
adminRoute.delete('/logout', adminAuthMiddleware, logoutAdmin);
adminRoute.get('/', subAdminAuthMiddleware, fetchAdmin);

//users routes
export const adminUserRoute = express.Router();
adminUserRoute.get('/', subAdminAuthMiddleware, fetchAllUsers);
adminUserRoute.get('/:userId', subAdminAuthMiddleware, fetchSingleUser);
adminUserRoute.put('/toggle-suspend/:userId', subAdminAuthMiddleware, toggleSuspendAccount);

//Referral routes
export const adminReferralRoute = express.Router();
adminReferralRoute.get('/', subAdminAuthMiddleware, fetchAllReferrals);
adminReferralRoute.get('/:referralId', subAdminAuthMiddleware, fetchSingleReferral);

//Withdrawal routes
export const adminWithdrawalRoute = express.Router();
adminWithdrawalRoute.get('/', subAdminAuthMiddleware, fetchAllUserWithdrawals);
adminWithdrawalRoute.get('/:withdrawalId', subAdminAuthMiddleware, fetchUserSingleWithdrawal);
adminWithdrawalRoute.put('/approve-withdrawal/:withdrawalId', subAdminAuthMiddleware, approveWithdrawal);
adminWithdrawalRoute.put('/decline-withdrawal/:withdrawalId', subAdminAuthMiddleware, declineWithdrawal);

//Wallet routes
export const adminWalletRoute = express.Router();
adminWalletRoute.get('/', subAdminAuthMiddleware, fetchAllUserWallet);
adminWalletRoute.get('/:walletId', subAdminAuthMiddleware, fetchSingleUserWallet);
