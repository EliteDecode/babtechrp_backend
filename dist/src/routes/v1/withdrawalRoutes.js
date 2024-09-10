"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRoute = void 0;
const express_1 = __importDefault(require("express"));
const withdrawalControllers_1 = require("../../controllers/withdrawalControllers");
const authHandler_1 = __importDefault(require("../../middleware/authHandler"));
const validationHandler_1 = require("../../middleware/validationHandler");
const withdrawalValidation_1 = require("../../validation/withdrawalValidation");
exports.withdrawalRoute = express_1.default.Router();
exports.withdrawalRoute.get('/', authHandler_1.default, withdrawalControllers_1.fetchUserWithdrawals);
exports.withdrawalRoute.post('/request-withdrawal', authHandler_1.default, (0, validationHandler_1.validateRequest)(withdrawalValidation_1.requestWithdrawalSchema), withdrawalControllers_1.requestWithdrawal);
//Admin Wallet
