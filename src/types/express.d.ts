import { Request } from 'express';
import { IUser } from '../interfaces/IUser';
import { IAdmin } from '../interfaces/IAdmin';

export interface RequestCustom extends Request {
	user?: IUser;
	admin?: IAdmin;
}
