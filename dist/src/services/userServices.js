"use strict";
//1. fetch user details
//2. update user details
//3. change email
//4. confirm change of email
//5. chnage password
//6. delete Account
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
exports.delete_user_account = exports.change_user_password = exports.verify_user_email = exports.change_user_email = exports.update_user_details = exports.fetch_user_details = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
const emailUtils_1 = __importDefault(require("../utils/emailUtils"));
const authTokenModel_1 = __importDefault(require("../models/authTokenModel"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const fetch_user_details = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const fetchUser = yield userModel_1.default.findById(id).select('-password');
        if (!fetchUser) {
            throw new Error('User not found');
        }
        return {
            success: true,
            message: 'User details fetched successfully',
            data: fetchUser
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.fetch_user_details = fetch_user_details;
const update_user_details = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        // const { userId } = params.query;
        const userData = params.data;
        // First, check if the user exists
        const checkUser = yield userModel_1.default.findById(id);
        if (!checkUser) {
            throw new Error('User not found');
        }
        if (userData.email) {
            throw new Error('Email cannot be updated');
        }
        // // Then check for authorization
        // if (userId !== id) {
        // 	throw new Error('You are not authorized to update this user');
        // }
        const updateUser = yield userModel_1.default.findByIdAndUpdate(id, Object.assign(Object.assign({}, userData), { isProfileUpdated: true }), { new: true }).select('-password');
        return {
            success: true,
            message: 'User details updated successfully',
            data: updateUser && updateUser
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.update_user_details = update_user_details;
const change_user_email = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const { email } = params.data;
        const checkUser = yield userModel_1.default.findOne({ email });
        if (checkUser) {
            throw new Error('Email already exists');
        }
        const checkExistingToken = yield authTokenModel_1.default.findOne({ userId: id });
        if (checkExistingToken) {
            throw new Error('Verification code already sent to your email');
        }
        const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
        const hashedVerificationCode = yield bcrypt_1.default.hash(verificationCode, 10);
        yield authTokenModel_1.default.create({
            userId: id,
            newEmail: email,
            authCode: hashedVerificationCode,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
        });
        // Send verification email using Nodemailer
        yield (0, emailUtils_1.default)({
            email: email,
            subject: 'Verify Your Email',
            text: `Your verification code is: ${verificationCode}`
        });
        return {
            success: true,
            message: 'Verification code sent to your email',
            data: null
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.change_user_email = change_user_email;
const verify_user_email = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const userAuthInfo = params.data;
        const fetchUserToken = yield authTokenModel_1.default.findOne({
            userId: id
            // expiresAt: { $gt: new Date() }
        });
        if (!fetchUserToken || !fetchUserToken.authCode) {
            throw new Error('The verification code you entered is incorrect or has expired. Please try again');
        }
        const isMatch = userAuthInfo.authCode && (yield bcrypt_1.default.compare(userAuthInfo.authCode.toString(), fetchUserToken.authCode));
        if (!isMatch) {
            throw new Error('Invalid or expired verification code');
        }
        const updateUser = yield userModel_1.default.findByIdAndUpdate(fetchUserToken.userId, { email: fetchUserToken.newEmail }, { new: true });
        yield authTokenModel_1.default.findByIdAndDelete(fetchUserToken._id);
        return {
            success: true,
            message: 'Email successfully verified',
            data: updateUser
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.verify_user_email = verify_user_email;
const change_user_password = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const { oldPassword, newPassword } = params.data;
        const user = yield userModel_1.default.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid old password');
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        return {
            success: true,
            message: 'Password updated successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.change_user_password = change_user_password;
const delete_user_account = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const checkUser = yield userModel_1.default.findById(id);
        if (!checkUser) {
            throw new Error('User not found');
        }
        yield userModel_1.default.findByIdAndDelete(id);
        yield tokenModel_1.default.findOneAndDelete({ userId: id });
        return {
            success: true,
            message: 'User deleted successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.delete_user_account = delete_user_account;
