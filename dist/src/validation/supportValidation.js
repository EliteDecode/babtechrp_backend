"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendMessageSchema = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        'string.empty': 'Complaint title is required.',
        'string.min': 'Name must be at least 5 characters long.'
    }),
    message: joi_1.default.string().required().messages({
        'string.empty': 'Complaint message is required.',
        'string.min': 'Name must be at least 15 characters long.'
    })
});
