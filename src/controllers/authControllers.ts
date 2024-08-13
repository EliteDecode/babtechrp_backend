import { Request, Response } from 'express';
import { register } from '../services/authServices';

export const registerUser = async (err: Error, req: Request, res: Response) => {
	try {
		const user = await register(req.body);
		res.status(201).json(user);
	} catch (error) {
		res.status(400).json({ error: err.message });
	}
};
