"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authHandler_1 = __importDefault(require("../../middleware/authHandler"));
const validationHandler_1 = require("../../middleware/validationHandler");
const referralControllers_1 = require("../../controllers/referralControllers");
const referralValidation_1 = require("../../validation/referralValidation");
const referralRoute = express_1.default.Router();
referralRoute.post('/', authHandler_1.default, (0, validationHandler_1.validateRequest)(referralValidation_1.addReferralSchema), referralControllers_1.addReferral);
referralRoute.get('/', authHandler_1.default, referralControllers_1.getReferral);
referralRoute.get('/:referralId', authHandler_1.default, referralControllers_1.geSingleReferral);
referralRoute.put('/:referralId', authHandler_1.default, referralControllers_1.updateReferral);
referralRoute.delete('/:referralId', authHandler_1.default, referralControllers_1.deleteReferral);
exports.default = referralRoute;
