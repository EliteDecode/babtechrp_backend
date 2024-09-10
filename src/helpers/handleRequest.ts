import { Response } from 'express';
import { RequestCustom } from '../types/express';

// Higher-order function to handle try/catch logic
export const handleRequest = (serviceFunction: (body: any) => Promise<any>) => {
	return async (req: RequestCustom, res: Response) => {
		try {
			const params = {
				data: req.body,
				user: req.user,
				admin: req.admin,
				query: req.params
			};

			const data = await serviceFunction(params);
			res.status(200).json(data);
		} catch (error: any) {
			res.status(400).json({ success: false, message: error.message, data: null });
		}
	};
};
