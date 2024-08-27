import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';
import { IUser } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';
import userModel from '../models/userModel';

// Extending the Request interface
interface AuthenticatedRequest extends Request {
	user?: IUser;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			const data = {
				success: false,
				message: 'Access Denied',
				data: null
			};
			const token = req.headers.authorization.split(' ')[1];
			if (!token) return res.status(401).send(data);

			const verified = jwtUtils.verifyToken(token) as JwtPayload & { id: IUser['_id'] };
			const fetchuser = await userModel.findById(verified.id);
			if (!fetchuser) return res.status(401).send(data);
			req.user = verified as IUser;
			next();
		} catch (err) {
			const data = {
				success: false,
				message: 'Invalid Token',
				data: null
			};

			res.status(401).send(data);
		}
	} else {
		const data = {
			success: false,
			message: 'Access Denied',
			data: null
		};

		res.status(401).send(data);
	}
};

export default authMiddleware;
