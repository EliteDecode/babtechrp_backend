import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';
import { IUser } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';

// Extending the Request interface
interface AuthenticatedRequest extends Request {
	user?: IUser;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) return res.status(401).send('Access Denied');
		try {
			const verified = jwtUtils.verifyToken(token) as JwtPayload & { id: IUser['_id'] };
			req.user = verified as IUser;
			next();
		} catch (err) {
			res.status(400).send('Invalid Token');
		}
	} else {
		res.status(401).send('Access Denied');
	}
};

export default authMiddleware;
