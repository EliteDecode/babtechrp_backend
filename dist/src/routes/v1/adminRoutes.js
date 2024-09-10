"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWalletRoute = exports.adminWithdrawalRoute = exports.adminReferralRoute = exports.adminUserRoute = exports.adminRoute = void 0;
const express_1 = __importDefault(require("express"));
const adminAuthHandler_1 = require("../../middleware/adminAuthHandler");
const validationHandler_1 = require("../../middleware/validationHandler");
const adminValidation_1 = require("../../validation/adminValidation");
const adminControllers_1 = require("../../controllers/adminControllers");
const withdrawalControllers_1 = require("../../controllers/withdrawalControllers");
const walletControllers_1 = require("../../controllers/walletControllers");
const userValidation_1 = require("../../validation/userValidation");
exports.adminRoute = express_1.default.Router();
exports.adminRoute.post('/login', (0, validationHandler_1.validateRequest)(adminValidation_1.loginValidationSchema), adminControllers_1.loginAdmin);
exports.adminRoute.post('/register', adminAuthHandler_1.adminAuthMiddleware, (0, validationHandler_1.validateRequest)(adminValidation_1.registerValidationSchema), adminControllers_1.createSubAdmin);
exports.adminRoute.put('/update/:adminId', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.updateSubAdmin);
exports.adminRoute.delete('/delete/:adminId', adminAuthHandler_1.adminAuthMiddleware, adminControllers_1.deleteSubAdmin);
exports.adminRoute.put('/suspend/:adminId', adminAuthHandler_1.adminAuthMiddleware, adminControllers_1.suspendSubAdmin);
exports.adminRoute.post('/logout', adminAuthHandler_1.adminAuthMiddleware, adminControllers_1.logoutAdmin);
exports.adminRoute.get('/', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.fetchAdmin);
exports.adminRoute.post('/refresh-token', (0, validationHandler_1.validateRequest)(userValidation_1.requestAccessTokenSchema), adminControllers_1.requestAccessToken);
//users routes
exports.adminUserRoute = express_1.default.Router();
exports.adminUserRoute.get('/', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.fetchAllUsers);
exports.adminUserRoute.get('/:userId', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.fetchSingleUser);
exports.adminUserRoute.put('/toggle-suspend/:userId', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.toggleSuspendAccount);
//Referral routes
exports.adminReferralRoute = express_1.default.Router();
exports.adminReferralRoute.get('/', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.fetchAllReferrals);
exports.adminReferralRoute.get('/:referralId', adminAuthHandler_1.subAdminAuthMiddleware, adminControllers_1.fetchSingleReferral);
//Withdrawal routes
exports.adminWithdrawalRoute = express_1.default.Router();
exports.adminWithdrawalRoute.get('/', adminAuthHandler_1.subAdminAuthMiddleware, withdrawalControllers_1.fetchAllUserWithdrawals);
exports.adminWithdrawalRoute.get('/:withdrawalId', adminAuthHandler_1.subAdminAuthMiddleware, withdrawalControllers_1.fetchUserSingleWithdrawal);
exports.adminWithdrawalRoute.put('/approve-withdrawal/:withdrawalId', adminAuthHandler_1.subAdminAuthMiddleware, withdrawalControllers_1.approveWithdrawal);
exports.adminWithdrawalRoute.put('/decline-withdrawal/:withdrawalId', adminAuthHandler_1.subAdminAuthMiddleware, withdrawalControllers_1.declineWithdrawal);
//Wallet routes
exports.adminWalletRoute = express_1.default.Router();
exports.adminWalletRoute.get('/', adminAuthHandler_1.subAdminAuthMiddleware, walletControllers_1.fetchAllUserWallet);
exports.adminWalletRoute.get('/:walletId', adminAuthHandler_1.subAdminAuthMiddleware, walletControllers_1.fetchSingleUserWallet);
