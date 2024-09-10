"use strict";
//1. Regsiter User
//2. Verify User
//3. Login User
//4. Logout
//5. Forgot Password
//6. Reset Password
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
exports.get_access_token = exports.reset_password = exports.forgot_password = exports.logout_user = exports.login_user = exports.verify_user_token = exports.register_user = void 0;
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const userModel_1 = __importDefault(require("../models/userModel"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailUtils_1 = __importDefault(require("../utils/emailUtils"));
const authTokenModel_1 = __importDefault(require("../models/authTokenModel"));
const cleanUpExpiredUser_1 = require("../helpers/cleanUpExpiredUser");
const generateReferralCode_1 = require("../helpers/generateReferralCode");
const walletModel_1 = __importDefault(require("../models/walletModel"));
const register_user = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract user data from req.body
        const userData = params.data;
        // Check if the user already exists
        const existingUser = yield userModel_1.default.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
            // Check if there is an existing valid auth code
            const getAuthCode = yield authTokenModel_1.default.findOne({
                userId: existingUser._id,
                expiresAt: { $gt: new Date() }
            });
            if (getAuthCode) {
                throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
            }
            throw new Error('User with this email already exists. Please login or use a different email.');
        }
        // Hash the user's password
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
        // Create a new user
        const newUser = new userModel_1.default({
            fullname: userData.fullname,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            isEmailVerified: false,
            isSuspended: false,
            phone: null,
            address: null,
            referralCode: (0, generateReferralCode_1.generateReferralNumber)()
        });
        try {
            yield newUser.save();
            // Generate a 5-digit verification code
            const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
            const hashedVerificationCode = yield bcrypt_1.default.hash(verificationCode, 10);
            // Store the verification code in the authTokenModel
            yield authTokenModel_1.default.create({
                userId: newUser._id,
                authCode: hashedVerificationCode,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
            });
            // Send verification email using Nodemailer
            yield (0, emailUtils_1.default)({
                email: newUser.email,
                subject: 'Verify Your Email',
                text: `
			    <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
			        <h2 style="color: #007BFF;">Email Verification</h2>
			        <p>Your verification code is:</p>
			        <p style="font-size: 24px; font-weight: bold; color: #000;">${verificationCode}</p>
			        <p>Please enter this code to verify your email address.</p>
			        <br/>
			        <p>Thank you!</p>
			    </div>
			`
            });
        }
        catch (emailError) {
            // Cleanup tokens if email sending fails
            yield (0, cleanUpExpiredUser_1.cleanupTokensAfterFailedEmailMessage)({ id: newUser._id });
            throw new Error(`Error sending verification email: ${emailError.message}`);
        }
        return {
            success: true,
            message: 'User registered successfully. Please verify your email using the code sent to your email.',
            data: { _id: newUser._id, email: newUser.email }
        };
    }
    catch (error) {
        throw new Error(`Error registering user ${error.message}`);
    }
});
exports.register_user = register_user;
const verify_user_token = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAuthInfo = params.data;
        const { userId } = params.query;
        const fetchUserToken = yield authTokenModel_1.default.findOne({
            userId: userId,
            expiresAt: { $gt: new Date() }
        });
        if (!fetchUserToken || !fetchUserToken.authCode) {
            throw new Error('Verification code is incorrect');
        }
        const isMatch = userAuthInfo.authCode && (yield bcrypt_1.default.compare(userAuthInfo.authCode.toString(), fetchUserToken.authCode));
        if (!isMatch) {
            throw new Error('Invalid or expired verification code');
        }
        const updateUser = yield userModel_1.default.findByIdAndUpdate(fetchUserToken.userId, { isEmailVerified: true }, { new: true });
        const newWallet = new walletModel_1.default({
            userId: fetchUserToken.userId,
            total: 0,
            withdrawn: 0,
            balance: 0,
            transactions: []
        });
        yield newWallet.save();
        yield authTokenModel_1.default.findByIdAndDelete(fetchUserToken._id);
        return {
            success: true,
            message: 'Email successfully verified',
            data: updateUser
        };
    }
    catch (error) {
        throw new Error(`Error verifying user token: ${error.message}`);
    }
});
exports.verify_user_token = verify_user_token;
const login_user = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = params.data;
    const user = yield userModel_1.default.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error('User not found');
    }
    if (user.isSuspended) {
        throw new Error('Your account has been suspended');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const tokens = jwtUtils_1.default.generateTokens(user);
    try {
        const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);
        const checkExistingTokens = yield tokenModel_1.default.findOne({ userId: user._id });
        if (checkExistingTokens) {
            yield tokenModel_1.default.findOneAndUpdate({ userId: user._id }, { refreshToken: tokens.refreshToken, expiresAt: expiresAt });
        }
        else {
            yield tokenModel_1.default.create({ userId: user._id, refreshToken: tokens.refreshToken, expiresAt: expiresAt });
        }
        return {
            success: true,
            message: 'Login successful',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        };
    }
    catch (error) {
        throw new Error('Error logging in, please try again');
    }
});
exports.login_user = login_user;
const logout_user = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = params.data;
    try {
        const result = yield tokenModel_1.default.findOneAndDelete({ refreshToken });
        if (!result) {
            throw new Error('Refresh token not found');
        }
        return {
            success: true,
            message: 'Logout successful',
            data: null
        };
    }
    catch (error) {
        throw new Error(`Error logging out user: ${error.message}`);
    }
});
exports.logout_user = logout_user;
const forgot_password = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = params.data;
    const fetchUser = yield userModel_1.default.findOne({ email: email.toLowerCase() });
    const checkUserWithToken = yield authTokenModel_1.default.findOne({ userId: fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser._id });
    if (!fetchUser) {
        throw new Error('User with this email does not exist');
    }
    if (checkUserWithToken) {
        throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
    }
    try {
        const resetToken = jwtUtils_1.default.generateResetToken(fetchUser);
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
        yield (0, emailUtils_1.default)({
            email: fetchUser.email,
            subject: 'Password Reset Request',
            text: `
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p>Please click on the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-align: center; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
        });
        yield authTokenModel_1.default.create({
            userId: fetchUser._id,
            authCode: resetToken,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        return {
            success: true,
            message: 'Password reset email sent successfully',
            data: resetToken
        };
    }
    catch (error) {
        yield (0, cleanUpExpiredUser_1.cleanupTokensAfterFailedEmailMessage)({ id: fetchUser._id });
        throw new Error(`Error sending password reset email: ${error}`);
    }
});
exports.forgot_password = forgot_password;
const reset_password = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, token } = params.data;
    const decoded = jwtUtils_1.default.verifyToken(token);
    const fetchUser = yield userModel_1.default.findById(decoded.id);
    if (!fetchUser) {
        throw new Error('Invalid or expired reset token');
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield userModel_1.default.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        return {
            success: true,
            message: 'Password reset successful',
            data: null
        };
    }
    catch (error) {
        throw new Error(`Error resetting password: ${error}`);
    }
});
exports.reset_password = reset_password;
const get_access_token = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = params.data;
        const checkExistingTokens = yield tokenModel_1.default.findOne({ refreshToken: token.refreshToken });
        if (!checkExistingTokens) {
            throw new Error('Invalid refresh token');
        }
        const decoded = jwtUtils_1.default.verifyRefreshToken(token.refreshToken);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }
        const user = yield userModel_1.default.findById(decoded.id);
        const tokens = jwtUtils_1.default.generateTokens(user);
        const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
        yield tokenModel_1.default.findOneAndUpdate({ userId: user === null || user === void 0 ? void 0 : user._id }, { refreshToken: tokens.refreshToken, expiresAt: new Date(Date.now() + refreshTokenExpiresIn) });
        return {
            success: true,
            message: 'Access token generated successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        };
    }
    catch (error) {
        throw new Error(`Error generating access token: ${error}`);
    }
});
exports.get_access_token = get_access_token;
