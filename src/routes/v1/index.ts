import express from 'express';
import authRoutes from './authRoutes';
import userRoute from './userRoutes';
import referralRoute from './referralRoutes';
import adminRoute from './adminRoutes';

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
		path: '/admin/auth',
		route: adminRoute
	}
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
