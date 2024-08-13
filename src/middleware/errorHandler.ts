import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

	res.status(statusCode);
	res.json({
		error: {
			message: statusCode === 500 ? 'Internal Server Error' : statusCode === 404 ? 'Route Not Found' : err.message,
			stack: process.env.NODE_ENV === 'production' ? null : err.stack
		}
	});
}
