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
exports.subAdminAuthMiddleware = exports.adminAuthMiddleware = void 0;
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const dataDenined = {
    success: false,
    message: 'Access Denied',
    data: null
};
const dataInvalid = {
    success: false,
    message: 'Invalid Token',
    data: null
};
const adminAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token)
            return res.status(401).send(dataDenined);
        try {
            const verified = jwtUtils_1.default.verifyAdminToken(token);
            const fetchAdmin = yield adminModel_1.default.findById(verified.id);
            if (!fetchAdmin || !fetchAdmin.isMain)
                return res.status(401).send(dataDenined);
            req.admin = verified;
            next();
        }
        catch (err) {
            res.status(401).send(dataInvalid);
        }
    }
    else {
        res.status(401).send(dataDenined);
    }
});
exports.adminAuthMiddleware = adminAuthMiddleware;
const subAdminAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token)
            return res.status(401).send('Access Denied');
        try {
            const verified = jwtUtils_1.default.verifyAdminToken(token);
            const fetchAdmin = yield adminModel_1.default.findById(verified.id);
            if (!fetchAdmin)
                return res.status(401).send('Access Denied');
            req.admin = verified;
            next();
        }
        catch (err) {
            res.status(401).send('Invalid Token');
        }
    }
    else {
        res.status(401).send('Access Denied');
    }
});
exports.subAdminAuthMiddleware = subAdminAuthMiddleware;
