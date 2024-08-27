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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = void 0;
// Higher-order function to handle try/catch logic
const handleRequest = (serviceFunction) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const params = {
                data: req.body,
                user: req.user,
                admin: req.admin,
                query: req.params
            };
            const data = yield serviceFunction(params);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message, data: null });
        }
    });
};
exports.handleRequest = handleRequest;
