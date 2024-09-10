"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleUserWallet = exports.fetchAllUserWallet = exports.fetchUserWallet = void 0;
const handleRequest_1 = require("../helpers/handleRequest");
const walletServices_1 = require("../services/walletServices");
exports.fetchUserWallet = (0, handleRequest_1.handleRequest)(walletServices_1.fetch_user_wallet);
//admin
exports.fetchAllUserWallet = (0, handleRequest_1.handleRequest)(walletServices_1.admin_fetch_user_wallet);
exports.fetchSingleUserWallet = (0, handleRequest_1.handleRequest)(walletServices_1.admin_fetch_single_user_wallet);
