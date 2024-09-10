"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const referralRoutes_1 = __importDefault(require("./referralRoutes"));
const adminRoutes_1 = require("./adminRoutes");
const stduentRoutes_1 = __importDefault(require("./stduentRoutes"));
const walletRoutes_1 = require("./walletRoutes");
const withdrawalRoutes_1 = require("./withdrawalRoutes");
const supportRoutes_1 = require("./supportRoutes");
const router = express_1.default.Router();
const defaultRoutes = [
    {
        path: '/auth',
        route: authRoutes_1.default
    },
    {
        path: '/user',
        route: userRoutes_1.default
    },
    {
        path: '/referral',
        route: referralRoutes_1.default
    },
    {
        path: '/wallet',
        route: walletRoutes_1.walletRoute
    },
    {
        path: '/withdrawal',
        route: withdrawalRoutes_1.withdrawalRoute
    },
    {
        path: '/support',
        route: supportRoutes_1.supportRoute
    },
    {
        path: '/admin/auth',
        route: adminRoutes_1.adminRoute
    },
    {
        path: '/admin/student',
        route: stduentRoutes_1.default
    },
    {
        path: '/admin/wallet',
        route: adminRoutes_1.adminWalletRoute
    },
    {
        path: '/admin/withdrawal',
        route: adminRoutes_1.adminWithdrawalRoute
    },
    {
        path: '/admin/users',
        route: adminRoutes_1.adminUserRoute
    },
    {
        path: '/admin/referrals',
        route: adminRoutes_1.adminReferralRoute
    }
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
