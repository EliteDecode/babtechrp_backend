"use strict";
//1. get all users
//2. get single user
//3. suspend user account
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
exports.fetch_single_referral = exports.fetch_all_referrals = exports.toggle_suspend_user_account = exports.fetch_single_user = exports.fetch_all_users = void 0;
const referralModel_1 = __importDefault(require("../models/referralModel"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const walletModel_1 = __importDefault(require("../models/walletModel"));
const fetch_all_users = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find().select('-password');
        if (!users) {
            throw new Error('No users found');
        }
        return {
            success: true,
            message: 'Users fetched successfully',
            data: users
        };
    }
    catch (error) {
        throw new Error(` ${error.message}`);
    }
});
exports.fetch_all_users = fetch_all_users;
const fetch_single_user = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = params.query;
        const user = yield userModel_1.default.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        const fetchReferals = yield referralModel_1.default.find({ referredBy: user === null || user === void 0 ? void 0 : user._id });
        const fetchWallet = yield walletModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
        return {
            success: true,
            message: 'User fetched successfully',
            data: {
                user,
                referrals: fetchReferals,
                wallet: fetchWallet
            }
        };
    }
    catch (error) {
        throw new Error(` ${error.message}`);
    }
});
exports.fetch_single_user = fetch_single_user;
const toggle_suspend_user_account = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = params.query;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.isSuspended = !user.isSuspended;
        yield tokenModel_1.default.findOneAndDelete({ userId: userId });
        const suspendedUser = yield user.save();
        return {
            success: true,
            message: suspendedUser.isSuspended ? 'User account suspended successfully' : 'User account activated successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error(` ${error.message}`);
    }
});
exports.toggle_suspend_user_account = toggle_suspend_user_account;
//Referalls
const fetch_all_referrals = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referrals = yield referralModel_1.default.find();
        return {
            success: true,
            message: 'Referrals fetched successfully',
            data: referrals
        };
    }
    catch (error) {
        throw new Error(` ${error.message}`);
    }
});
exports.fetch_all_referrals = fetch_all_referrals;
const fetch_single_referral = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referralId } = params.query;
        const referral = yield referralModel_1.default.findById(referralId);
        if (!referral) {
            throw new Error('Referral not found');
        }
        const user = yield userModel_1.default.findById(referral.referredBy).select('-password');
        return {
            success: true,
            message: 'Referral fetched successfully',
            data: { referral, user }
        };
    }
    catch (error) {
        throw new Error(` ${error.message}`);
    }
});
exports.fetch_single_referral = fetch_single_referral;
