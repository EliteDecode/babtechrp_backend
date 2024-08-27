"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineWithdrawal = exports.approveWithdrawal = exports.fetchUserSingleWithdrawal = exports.fetchAllUserWithdrawals = exports.requestWithdrawal = exports.fetchUserWithdrawals = void 0;
const handleRequest_1 = require("../helpers/handleRequest");
const withdrawalServices_1 = require("../services/withdrawalServices");
exports.fetchUserWithdrawals = (0, handleRequest_1.handleRequest)(withdrawalServices_1.fetch_user_withdrawals);
exports.requestWithdrawal = (0, handleRequest_1.handleRequest)(withdrawalServices_1.request_withdrawal);
//admin
exports.fetchAllUserWithdrawals = (0, handleRequest_1.handleRequest)(withdrawalServices_1.admin_fetch_user_withdrawals);
exports.fetchUserSingleWithdrawal = (0, handleRequest_1.handleRequest)(withdrawalServices_1.admin_fetch_user_single_withdrawal);
exports.approveWithdrawal = (0, handleRequest_1.handleRequest)(withdrawalServices_1.approve_withdrawal);
exports.declineWithdrawal = (0, handleRequest_1.handleRequest)(withdrawalServices_1.decline_withdrawal);
