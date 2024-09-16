import express from 'express';
import authRoutes from './authRoutes';
import userRoute from './userRoutes';
import referralRoute from './referralRoutes';
import { adminReferralRoute, adminRoute, adminUserRoute, adminWalletRoute, adminWithdrawalRoute } from './adminRoutes';
import path from 'path';
import studentRoute from './stduentRoutes';
import { walletRoute } from './walletRoutes';
import { withdrawalRoute } from './withdrawalRoutes';
import { supportRoute } from './supportRoutes';
import bstUserIdsRoutes from './bstUserIdsRoutes';

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoutes
	},
	{
		path: '/user',
		route: userRoute
	},
	{
		path: '/referral',
		route: referralRoute
	},
	{
		path: '/wallet',
		route: walletRoute
	},
	{
		path: '/withdrawal',
		route: withdrawalRoute
	},
	{
		path: '/support',
		route: supportRoute
	},
	{
		path: '/admin/auth',
		route: adminRoute
	},
	{
		path: '/admin/student',
		route: studentRoute
	},
	{
		path: '/admin/wallet',
		route: adminWalletRoute
	},
	{
		path: '/admin/withdrawal',
		route: adminWithdrawalRoute
	},
	{
		path: '/admin/users',
		route: adminUserRoute
	},
	{
		path: '/admin/referrals',
		route: adminReferralRoute
	},
	{
		path: '/admin/bstUserIds',
		route: bstUserIdsRoutes
	}
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
