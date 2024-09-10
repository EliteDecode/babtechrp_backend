"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReferralModel = new mongoose_1.default.Schema({
    referralCode: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    isMatched: {
        type: Boolean,
        default: false
    },
    referredBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Referral', ReferralModel);
