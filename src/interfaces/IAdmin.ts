import { Document } from 'mongoose';

export interface IAdmin extends Document {
	fullname: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	address: string;
	isMain?: boolean;
	isSuspended?: boolean;
}

export interface IAdminLogin extends Document {
	email: string;
	password: string;
}
