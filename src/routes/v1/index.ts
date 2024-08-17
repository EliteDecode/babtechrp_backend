import express from 'express';
import authRoutes from './authRoutes';
import userRoute from './userRoutes';

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoutes
	},
	{
		path: '/user',
		route: userRoute
	}
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
