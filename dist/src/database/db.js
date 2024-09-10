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
exports.connectDb = void 0;
const config_1 = require("../config/config");
const mongoose = require('mongoose');
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose.connect(config_1.SERVER.MONGODB_URI);
        logging.log('-------------------------------------------');
        logging.log(`MongoDB Connected: ${conn.connection.host}`);
        logging.log('-------------------------------------------');
    }
    catch (error) {
        logging.error('-------------------------------------------');
        logging.error(error);
        logging.error('-------------------------------------------');
        process.exit(1);
    }
});
exports.connectDb = connectDb;
