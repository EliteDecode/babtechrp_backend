"use strict";
//1. Add Referrals
//2. Get Referrals
//3. Get Referral by Id
//4. Update Referral
//5. Delete Referral
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
exports.delete_single_referral = exports.update_single_referral = exports.get_single_referral = exports.get_referrals = exports.add_Referral = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const referralModel_1 = __importDefault(require("../models/referralModel"));
const add_Referral = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const ReferralData = params.data;
        const fetchUser = yield userModel_1.default.findById(id).select('-password');
        if (!fetchUser)
            throw new Error('User not found');
        const checkIfReferralExists = yield referralModel_1.default.findOne({ referredBy: id, phone: ReferralData.phone });
        if (checkIfReferralExists)
            throw new Error('Referral with this number already exists');
        yield referralModel_1.default.create(Object.assign(Object.assign({ referredBy: id }, ReferralData), { isMatched: false, referralCode: fetchUser.referralCode }));
        return {
            success: true,
            message: 'Referral added successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.add_Referral = add_Referral;
const get_referrals = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = params.user;
        const referrals = yield referralModel_1.default.find({ referredBy: id });
        if (!referrals)
            throw new Error('No referrals found');
        return {
            success: true,
            message: 'Referrals fetched successfully',
            data: referrals
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.get_referrals = get_referrals;
const get_single_referral = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referralId } = params.query;
        const referral = yield referralModel_1.default.findById(referralId);
        if (!referral)
            throw new Error('Referral not found');
        return {
            success: true,
            message: 'Referral fetched successfully',
            data: referral
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.get_single_referral = get_single_referral;
const update_single_referral = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referralId } = params.query;
        const referralData = params.data;
        const fetchReferral = yield referralModel_1.default.findById(referralId);
        if (!fetchReferral)
            throw new Error('Referral not found');
        if ((fetchReferral === null || fetchReferral === void 0 ? void 0 : fetchReferral.isMatched) === true && (fetchReferral === null || fetchReferral === void 0 ? void 0 : fetchReferral.phone) !== (referralData === null || referralData === void 0 ? void 0 : referralData.phone)) {
            throw new Error('Referral has already been matched, you cannot update the phone number');
        }
        const referral = yield referralModel_1.default.findByIdAndUpdate(referralId, referralData, { new: true });
        if (referral) {
            return {
                success: true,
                message: 'Referral updated successfully',
                data: referral
            };
        }
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.update_single_referral = update_single_referral;
const delete_single_referral = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referralId } = params.query;
        const fetchReferral = yield referralModel_1.default.findById(referralId);
        if (!fetchReferral)
            throw new Error('Referral not found');
        if ((fetchReferral === null || fetchReferral === void 0 ? void 0 : fetchReferral.isMatched) === true) {
            throw new Error('Referral has already been matched, you cannot delete this referral');
        }
        if (!fetchReferral)
            throw new Error('Referral not found');
        yield referralModel_1.default.findByIdAndDelete(referralId);
        return {
            success: true,
            message: 'Referral deleted successfully',
            data: null
        };
    }
    catch (error) {
        throw new Error('Error deleting referral');
    }
});
exports.delete_single_referral = delete_single_referral;
