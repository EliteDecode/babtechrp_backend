"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shutdown = exports.Main = exports.httpServer = void 0;
const http_1 = __importDefault(require("http"));
require("./config/logging");
const config_1 = require("./config/config");
const db_1 = require("./database/db");
const app_1 = require("./app");
const Main = () => {
    logging.info('-------------------------------------------');
    logging.info('Connect Database');
    logging.info('-------------------------------------------');
    (0, db_1.connectDb)();
    logging.info('-------------------------------------------');
    logging.info('Start Application');
    logging.info('-------------------------------------------');
    exports.httpServer = http_1.default.createServer(app_1.application);
    exports.httpServer.listen(config_1.SERVER.SERVER_PORT, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${config_1.SERVER.SERVER_HOSTNAME}:${config_1.SERVER.SERVER_PORT}`);
        logging.log('----------------------------------------');
    });
};
exports.Main = Main;
const Shutdown = (callback) => {
    exports.httpServer && exports.httpServer.close(callback);
};
exports.Shutdown = Shutdown;
(0, exports.Main)();
