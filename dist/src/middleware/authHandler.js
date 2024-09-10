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
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const data = {
                success: false,
                message: 'Access Denied',
                data: null
            };
            const token = req.headers.authorization.split(' ')[1];
            if (!token)
                return res.status(401).send(data);
            const verified = jwtUtils_1.default.verifyToken(token);
            const fetchuser = yield userModel_1.default.findById(verified.id);
            if (!fetchuser)
                return res.status(401).send(data);
            req.user = verified;
            next();
        }
        catch (err) {
            const data = {
                success: false,
                message: 'Invalid Token',
                data: null
            };
            res.status(401).send(data);
        }
    }
    else {
        const data = {
            success: false,
            message: 'Access Denied',
            data: null
        };
        res.status(401).send(data);
    }
});
exports.default = authMiddleware;
