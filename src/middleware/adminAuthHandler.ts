import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';
import { IUser } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';
import { IAdmin } from '../interfaces/IAdmin';
import adminModel from '../models/adminModel';

// Extending the Request interface
interface AuthenticatedRequest extends Request {
	admin?: IAdmin;
}

const dataDenined = {
	success: false,
	message: 'Access Denied',
	data: null
};

const dataInvalid = {
	success: false,
	message: 'Invalid Token',
	data: null
};

export const adminAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) return res.status(401).send(dataDenined);
		try {
			const verified = jwtUtils.verifyAdminToken(token) as JwtPayload & { id: IAdmin['_id'] };
			const fetchAdmin = await adminModel.findById(verified.id);
			if (!fetchAdmin || !fetchAdmin.isMain) return res.status(401).send(dataDenined);
			req.admin = verified as IAdmin;
			next();
		} catch (err) {
			res.status(401).send(dataInvalid);
		}
	} else {
		res.status(401).send(dataDenined);
	}
};

export const subAdminAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) return res.status(401).send('Access Denied');
		try {
			const verified = jwtUtils.verifyAdminToken(token) as JwtPayload & { id: IAdmin['_id'] };
			const fetchAdmin = await adminModel.findById(verified.id);
			if (!fetchAdmin) return res.status(401).send('Access Denied');
			req.admin = verified as IAdmin;
			next();
		} catch (err) {
			res.status(401).send('Invalid Token');
		}
	} else {
		res.status(401).send('Access Denied');
	}
};
