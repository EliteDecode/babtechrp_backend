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
exports.application = void 0;
const express_1 = __importDefault(require("express"));
const loggingHandler_1 = require("./middleware/loggingHandler");
const corsHandler_1 = require("./middleware/corsHandler");
const errorHandler_1 = require("./middleware/errorHandler");
const v1_1 = __importDefault(require("./routes/v1"));
require("./config/logging");
const node_cron_1 = __importDefault(require("node-cron"));
const cleanUpExpiredUser_1 = require("./helpers/cleanUpExpiredUser");
const application = (0, express_1.default)();
exports.application = application;
logging.info('-------------------------------------------');
logging.info('Starting the application');
logging.info('-------------------------------------------');
application.use(express_1.default.json());
application.use(express_1.default.urlencoded({ extended: true }));
logging.info('-------------------------------------------');
logging.info('Logging & Configuration');
logging.info('-------------------------------------------');
application.use(loggingHandler_1.loggingHandler);
application.use(corsHandler_1.corsHandler);
logging.info('-------------------------------------------');
logging.info('Errors Handling');
logging.info('-------------------------------------------');
application.use(errorHandler_1.errorHandler);
//v1 api routes
application.use('/bst/v1', v1_1.default);
//Cleanup
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cleanUpExpiredUser_1.cleanupExpiredTokens)();
}));
