import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../interfaces/IUser';

declare module 'express-serve-static-core' {
	interface Request {
		user?: JwtPayload & IUser; // Adjust this to match your user type
	}
}
