"use strict";
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
exports.cleanupTokensAfterFailedEmailMessage = exports.cleanupExpiredTokens = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const authTokenModel_1 = __importDefault(require("../models/authTokenModel"));
// Cleanup expired tokens and delete associated users
const cleanupExpiredTokens = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const expiredTokens = yield authTokenModel_1.default.find({ expiresAt: { $lt: now } });
        // Parallel deletion for better performance
        yield Promise.all(expiredTokens.map((token) => __awaiter(void 0, void 0, void 0, function* () {
            yield userModel_1.default.findOneAndDelete({ _id: token.userId, isEmailVerified: false });
            yield authTokenModel_1.default.findByIdAndDelete(token._id);
        })));
    }
    catch (error) {
        console.error('Error during expired token cleanup:', error);
    }
});
exports.cleanupExpiredTokens = cleanupExpiredTokens;
// Cleanup tokens and user after a failed email verification
const cleanupTokensAfterFailedEmailMessage = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    try {
        yield userModel_1.default.findOneAndDelete({ _id: id, isEmailVerified: false });
        yield authTokenModel_1.default.findOneAndDelete({ userId: id });
    }
    catch (error) {
        console.error(`Error during cleanup after failed email for user ${id}:`, error);
    }
});
exports.cleanupTokensAfterFailedEmailMessage = cleanupTokensAfterFailedEmailMessage;
