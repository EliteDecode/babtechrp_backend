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
exports.admin_fetch_single_user_wallet = exports.admin_fetch_user_wallet = exports.fetch_user_wallet = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const walletModel_1 = __importDefault(require("../models/walletModel"));
const fetch_user_wallet = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const wallet = yield walletModel_1.default.findOne({ userId: id });
        if (!wallet)
            throw new Error('Wallet not found');
        return {
            success: true,
            message: 'Wallet fetched successfully',
            data: wallet
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.fetch_user_wallet = fetch_user_wallet;
//Admin
const admin_fetch_user_wallet = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallets = yield walletModel_1.default.find();
        // const walletsWithUserDetails = [];
        // for (const wallet of wallets) {
        // 	const user = await User.findById(wallet.userId).select('-password -otherSensitiveFields');
        // 	if (user) {
        // 		walletsWithUserDetails.push({
        // 			wallet,
        // 			user
        // 		});
        // 	}
        // }
        return {
            success: true,
            message: 'Wallets fetched successfully',
            data: wallets
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.admin_fetch_user_wallet = admin_fetch_user_wallet;
const admin_fetch_single_user_wallet = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId } = params.query;
        const wallet = yield walletModel_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
        const fetchUser = yield userModel_1.default.findById(wallet.userId);
        return {
            success: true,
            message: 'Wallet fetched successfully',
            data: {
                wallet,
                user: fetchUser
            }
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.admin_fetch_single_user_wallet = admin_fetch_single_user_wallet;
