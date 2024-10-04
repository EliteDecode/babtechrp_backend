"use strict";
//1. fetch wallet
//2. Withdrawal Request.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decline_withdrawal = exports.approve_withdrawal = exports.admin_fetch_user_single_withdrawal = exports.admin_fetch_user_withdrawals = exports.fetch_user_withdrawals = exports.request_withdrawal = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const walletModel_1 = __importDefault(require("../models/walletModel"));
const withdrawalModel_1 = __importDefault(require("../models/withdrawalModel"));
const emailUtils_1 = __importDefault(require("../utils/emailUtils"));
const request_withdrawal = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const withdrawalData = params.data;
        const fetchUser = yield userModel_1.default.findById(id);
        if (!(fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.isProfileUpdated))
            throw new Error('Please update your profile before making a withdrawal');
        //Fetch all pending withdrawals to check so placement wont exceed total.
        const fetchPendingWithdrawalAmount = yield withdrawalModel_1.default.find({ userId: id, status: 'pending' });
        const pendingWithdrawalAmountSum = fetchPendingWithdrawalAmount.reduce((acc, curr) => acc + curr.amount, 0);
        const fetchWallet = yield walletModel_1.default.findOne({ userId: id });
        if (!fetchWallet)
            throw new Error('Wallet not found, withdrawal cant go through');
        if (withdrawalData.amount > fetchWallet.balance - 5000)
            throw new Error('Insufficient funds');
        if (pendingWithdrawalAmountSum + withdrawalData.amount > fetchWallet.balance - 5000)
            throw new Error('Pending withdrawal amount exceeds available balance');
        const withdrawals = yield withdrawalModel_1.default.create({
            userId: id,
            date: new Date(),
            status: 'pending',
            amount: withdrawalData.amount
        });
        return {
            success: true,
            message: 'Withdrawl Placed successfully',
            data: withdrawals
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.request_withdrawal = request_withdrawal;
const fetch_user_withdrawals = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const withdrawals = yield withdrawalModel_1.default.find({ userId: id });
        if (!withdrawals)
            throw new Error('No withdrawals found');
        return {
            success: true,
            message: 'Fetched all withdrawals successfully ',
            data: withdrawals
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.fetch_user_withdrawals = fetch_user_withdrawals;
//Admin
const admin_fetch_user_withdrawals = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const withdrawals = yield withdrawalModel_1.default.find();
        if (!withdrawals)
            throw new Error('No withdrawals found');
        return {
            success: true,
            message: 'Withdrawals fetched successfully',
            data: withdrawals
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.admin_fetch_user_withdrawals = admin_fetch_user_withdrawals;
const admin_fetch_user_single_withdrawal = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { withdrawalId } = params.query;
        const withdrawal = yield withdrawalModel_1.default.findById(withdrawalId);
        if (!withdrawal)
            throw new Error('Withdrawal details not found');
        const fetchUser = yield userModel_1.default.findById(withdrawal.userId);
        return {
            success: true,
            message: 'Withdrawal fetched successfully',
            data: {
                withdrawal,
                user: fetchUser
            }
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.admin_fetch_user_single_withdrawal = admin_fetch_user_single_withdrawal;
const approve_withdrawal = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { withdrawalId } = params.query;
        const withdrawal = yield withdrawalModel_1.default.findById(withdrawalId);
        if (!withdrawal)
            throw new Error('Withdrawal details not found');
        if (withdrawal.status == 'approved')
            throw new Error('Withdrawal has already been approved');
        if (withdrawal.status == 'declined')
            throw new Error('Withdrawal has already been declined');
        const fetchWallets = yield walletModel_1.default.findOne({ userId: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.userId });
        withdrawal.status = 'approved';
        fetchWallets.balance = fetchWallets.total - withdrawal.amount;
        fetchWallets.withdrawn = fetchWallets.withdrawn + withdrawal.amount;
        fetchWallets.transactions.push({
            amount: withdrawal.amount,
            date: new Date(),
            type: 'debit'
        });
        yield withdrawal.save();
        yield fetchWallets.save();
        const fetchUser = yield userModel_1.default.findById(withdrawal.userId);
        if (!fetchUser)
            throw new Error('User not Found');
        yield (0, emailUtils_1.default)({
            email: fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.email,
            subject: 'Withdrawal Request Approved',
            text: `
				<div style="font-family: Arial, sans-serif; color: #333;">
				<p>Dear ${fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.fullname},</p>
				<p>Your withdrawal request of <strong>${withdrawal.amount} Naira</strong> has been <strong>approved</strong>.</p>
				<p>Please log in to your account to view the details of your transaction.</p>
				<br/>
				<p>Best regards,</p>
				<p><strong>BST</strong></p>
				</div>
			`
        });
        return {
            success: true,
            message: 'Withdrawal approved successfully',
            data: {
                withdrawal,
                user: fetchUser
            }
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.approve_withdrawal = approve_withdrawal;
const decline_withdrawal = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { withdrawalId } = params.query;
        const withdrawal = yield withdrawalModel_1.default.findById(withdrawalId);
        if (!withdrawal)
            throw new Error('Withdrawal details not found');
        if (withdrawal.status == 'declined')
            throw new Error('Withdrawal has already been declined');
        if (withdrawal.status == 'approved')
            throw new Error('Withdrawal has already been approved');
        withdrawal.status = 'declined';
        yield withdrawal.save();
        const fetchUser = yield userModel_1.default.findById(withdrawal.userId);
        if (!fetchUser)
            throw new Error('User not Found');
        yield (0, emailUtils_1.default)({
            email: fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.email,
            subject: 'Withdrawal Request Declined',
            text: `
				<div style="font-family: Arial, sans-serif; color: #333;">
				<p>Dear ${fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.fullname},</p>
				<p>We regret to inform you that your withdrawal request of <strong>${withdrawal.amount} Naira</strong> has been <strong>declined</strong>.</p>
				<p>Please log in to your account for more details or to make another request.</p>
				<br/>
				<p>Best regards,</p>
				<p><strong>BST</strong></p>
				</div>
			`
        });
        return {
            success: true,
            message: 'Withdrawal declined successfully',
            data: {
                withdrawal,
                user: fetchUser
            }
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.decline_withdrawal = decline_withdrawal;
