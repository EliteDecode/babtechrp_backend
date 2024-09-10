"use strict";
// Admin Login
// Create Admin
// Update Admin
// Delete Admin
// Suspend Admin
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_access_token = exports.fetch_admin_details = exports.logout_admin = exports.delete_sub_admin = exports.update_sub_admin = exports.suspend_SubAdmin = exports.create_SubAdmin = exports.login_Admin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const login_Admin = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = params.data;
        const admin = yield adminModel_1.default.findOne({ email });
        if (!admin) {
            throw new Error('Admin not found');
        }
        if (admin.isSuspended) {
            throw new Error('Account is suspended');
        }
        const isMatch = yield bcrypt_1.default.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const tokens = jwtUtils_1.default.generateAdminTokens(admin);
        const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);
        const checkExistingTokens = yield tokenModel_1.default.findOne({ adminId: admin._id });
        if (checkExistingTokens) {
            yield tokenModel_1.default.findOneAndUpdate({ userId: admin._id }, { refreshToken: tokens.refreshToken, expiresAt: expiresAt });
        }
        yield tokenModel_1.default.create({ adminId: admin._id, refreshToken: tokens.refreshToken, expiresAt: expiresAt });
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
        throw new Error(error.message);
    }
});
exports.login_Admin = login_Admin;
const create_SubAdmin = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminData = params.data;
        const { email, password } = adminData;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const { confirmPassword } = adminData, adminDataWithoutPassword = __rest(adminData, ["confirmPassword"]);
        const checkAdminExistence = yield adminModel_1.default.findOne({ email });
        if (checkAdminExistence) {
            throw new Error('Admin already exists');
        }
        const newAdmin = new adminModel_1.default(Object.assign(Object.assign({}, adminDataWithoutPassword), { password: hashedPassword }));
        yield newAdmin.save();
        return {
            success: true,
            message: 'Admin created successfully',
            data: newAdmin
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.create_SubAdmin = create_SubAdmin;
const suspend_SubAdmin = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = params.query;
        const fetchSubAdmin = yield adminModel_1.default.findById(adminId);
        if (!fetchSubAdmin) {
            throw new Error('Admin not found');
        }
        fetchSubAdmin.isSuspended = true;
        yield fetchSubAdmin.save();
        return {
            success: true,
            message: 'Admin suspended successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error('Error suspending admin');
    }
});
exports.suspend_SubAdmin = suspend_SubAdmin;
const update_sub_admin = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.admin;
        const { adminId } = params.query;
        const adminData = params.data;
        const fetchUser = yield adminModel_1.default.findById(id);
        if (!fetchUser)
            throw new Error('User not found');
        const referral = yield adminModel_1.default.findByIdAndUpdate(adminId, adminData, { new: true });
        return {
            success: true,
            message: 'Admin Updated successfully',
            data: referral
        };
    }
    catch (error) {
        throw new Error('Error updating referral: ' + error.message);
    }
});
exports.update_sub_admin = update_sub_admin;
const delete_sub_admin = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = params.query;
        yield adminModel_1.default.findOneAndDelete(adminId);
        return {
            success: true,
            message: 'Admin deleted successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error('Error deleting referral');
    }
});
exports.delete_sub_admin = delete_sub_admin;
const logout_admin = (params) => __awaiter(void 0, void 0, void 0, function* () {
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
        throw new Error(`${error.message}`);
    }
});
exports.logout_admin = logout_admin;
const fetch_admin_details = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.admin;
        const fetchAdmin = yield adminModel_1.default.findById(id).select('-password');
        if (!fetchAdmin) {
            throw new Error('Admin not found');
        }
        return {
            success: true,
            message: 'Admin details fetched successfully',
            data: fetchAdmin
        };
    }
    catch (error) {
        throw new Error(`${error.message}`);
    }
});
exports.fetch_admin_details = fetch_admin_details;
const get_access_token = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = params.data;
        const checkExistingTokens = yield tokenModel_1.default.findOne({ refreshToken: token.refreshToken });
        if (!checkExistingTokens) {
            throw new Error('Invalid refresh token');
        }
        const decoded = jwtUtils_1.default.verifyAdminRefreshToken(token.refreshToken);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }
        const admin = yield adminModel_1.default.findById(decoded.id);
        const tokens = jwtUtils_1.default.generateAdminTokens(admin);
        const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
        yield tokenModel_1.default.findOneAndUpdate({ userId: admin === null || admin === void 0 ? void 0 : admin._id }, { refreshToken: tokens.refreshToken, expiresAt: new Date(Date.now() + refreshTokenExpiresIn) });
        return {
            success: true,
            message: 'Access token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        };
    }
    catch (error) {
        throw new Error(` ${error}`);
    }
});
exports.get_access_token = get_access_token;
