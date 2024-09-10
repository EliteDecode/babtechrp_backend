"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReferralSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addReferralSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.'
    }),
    fullname: joi_1.default.string().min(3).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 3 characters long.'
    }),
    address: joi_1.default.string().min(3).required().messages({
        'string.empty': 'Address is required.',
        'string.min': 'Address must be at least 5 characters long.'
    }),
    phone: joi_1.default.string().min(10).required().messages({
        'string.empty': 'Phone number is required.',
        'string.min': 'Phone number must be at least 10 characters long.'
    }),
    course: joi_1.default.string().min(3).required().messages({
        'string.empty': 'Course is required.',
        'string.min': 'Course must be at least 3 characters long.'
    })
});
