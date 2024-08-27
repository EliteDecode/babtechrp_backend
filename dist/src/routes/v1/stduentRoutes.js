"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validationHandler_1 = require("../../middleware/validationHandler");
const studentControllers_1 = require("../../controllers/studentControllers");
const referralValidation_1 = require("../../validation/referralValidation");
const adminAuthHandler_1 = require("../../middleware/adminAuthHandler");
const studentRoute = express_1.default.Router();
studentRoute.post('/', adminAuthHandler_1.subAdminAuthMiddleware, (0, validationHandler_1.validateRequest)(referralValidation_1.addReferralSchema), studentControllers_1.addStudent);
studentRoute.get('', adminAuthHandler_1.subAdminAuthMiddleware, studentControllers_1.getStudent);
studentRoute.get('/:studentId', adminAuthHandler_1.subAdminAuthMiddleware, studentControllers_1.geSingleStudent);
studentRoute.put('/:studentId', adminAuthHandler_1.subAdminAuthMiddleware, studentControllers_1.updateStudent);
studentRoute.delete('/:studentId', adminAuthHandler_1.subAdminAuthMiddleware, studentControllers_1.deleteStudent);
exports.default = studentRoute;
