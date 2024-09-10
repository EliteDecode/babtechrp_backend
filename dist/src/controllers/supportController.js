"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const handleRequest_1 = require("../helpers/handleRequest");
const supportService_1 = require("../services/supportService");
exports.sendMessage = (0, handleRequest_1.handleRequest)(supportService_1.send_Message);
