"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoute = void 0;
const express_1 = __importDefault(require("express"));
const walletControllers_1 = require("../../controllers/walletControllers");
const authHandler_1 = __importDefault(require("../../middleware/authHandler"));
exports.walletRoute = express_1.default.Router();
exports.walletRoute.get('/', authHandler_1.default, walletControllers_1.fetchUserWallet);
