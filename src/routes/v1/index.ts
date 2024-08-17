import express from 'express';
import authRoutes from './authRoutes';
import userRoute from './userRoutes';
import referralRoute from './referralRoutes';

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
	}
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
