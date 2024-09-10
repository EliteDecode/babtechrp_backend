"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestAccessTokenSchema = exports.logoutValidationSchema = exports.suspendAccountSchema = exports.deleteAccountSchema = exports.updatePasswordSchema = exports.updateEmailSchema = exports.forgotPasswordSchema = exports.emailVerificationSchema = exports.loginValidationSchema = exports.registerValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerValidationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.'
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.'
    }),
    confirmPassword: joi_1.default.any().equal(joi_1.default.ref('password')).required().messages({
        'any.only': 'Confirm password does not match.'
    }),
    fullname: joi_1.default.string().min(3).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 3 characters long.'
    })
});
exports.loginValidationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.'
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required.'
    })
});
exports.emailVerificationSchema = joi_1.default.object({
    authCode: joi_1.default.number().required().messages({
        'string.empty': 'Verification code is required.'
    })
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.'
    })
});
exports.updateEmailSchema = joi_1.default.object({
    newEmail: joi_1.default.string().email().required().messages({
        'string.empty': 'New email is required.',
        'string.email': 'New email must be a valid email address.'
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required.'
    })
});
exports.updatePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required().messages({
        'string.empty': 'Current password is required.'
    }),
    newPassword: joi_1.default.string().min(8).required().messages({
        'string.empty': 'New password is required.',
        'string.min': 'New password must be at least 8 characters long.'
    }),
    confirmNewPassword: joi_1.default.any().equal(joi_1.default.ref('newPassword')).required().messages({
        'any.only': 'Confirm password does not match.'
    })
});
exports.deleteAccountSchema = joi_1.default.object({
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required.'
    })
});
exports.suspendAccountSchema = joi_1.default.object({
    reason: joi_1.default.string().optional().messages({
        'string.empty': 'Reason for suspension should be provided.'
    })
});
exports.logoutValidationSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required().messages({
        'string.empty': 'Refresh token is required.'
    })
});
exports.requestAccessTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required().messages({
        'string.empty': 'Refresh token is required.'
    })
});
exports.resetPasswordSchema = joi_1.default.object({
    password: joi_1.default.string().min(8).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.'
    }),
    confirmPassword: joi_1.default.any().equal(joi_1.default.ref('password')).required().messages({
        'any.only': 'Confirm password does not match.'
    }),
    token: joi_1.default.string().required().messages({
        'string.empty': 'Token is required.'
    })
});
