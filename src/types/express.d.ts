import { Request } from 'express';
import { IUser } from '../interfaces/IUser';
import { IAdmin } from '../interfaces/IAdmin';

// Import Express-specific UserProperty type from Passport
import { UserProperty } from 'express-serve-static-core';

// Extend the Express Request type, including Passport's modifications
export interface RequestCustom extends Request {
	user?: IUser & UserProperty;
	admin?: IAdmin;
}
