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
const passport_1 = __importDefault(require("passport"));
const register_1 = require("./passport/google/register");
const register_2 = require("./passport/facebook/register");
const register_3 = require("./passport/instagram/register");
const register_4 = require("./passport/github/register");
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
//InitializePassport
application.use(passport_1.default.initialize());
// Add strategies
passport_1.default.use(register_1.googleStrategy);
passport_1.default.use(register_2.facebookStrategy);
passport_1.default.use(register_3.instagramStrategy);
passport_1.default.use(register_4.githubStrategy);
//v1 api routes
application.use('/bst/v1', v1_1.default);
//Cleanup
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cleanUpExpiredUser_1.cleanupExpiredTokens)();
}));
