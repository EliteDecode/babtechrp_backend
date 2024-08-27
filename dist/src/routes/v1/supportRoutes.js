"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportRoute = void 0;
const express_1 = __importDefault(require("express"));
const validationHandler_1 = require("../../middleware/validationHandler");
const supportValidation_1 = require("../../validation/supportValidation");
const authHandler_1 = __importDefault(require("../../middleware/authHandler"));
const supportController_1 = require("../../controllers/supportController");
exports.supportRoute = express_1.default.Router();
exports.supportRoute.post('/send-message', (0, validationHandler_1.validateRequest)(supportValidation_1.sendMessageSchema), authHandler_1.default, supportController_1.sendMessage);
//Admin Wallet
