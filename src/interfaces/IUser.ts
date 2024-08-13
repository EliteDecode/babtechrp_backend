import { Document } from 'mongoose';

export interface IUser extends Document {
	fullname: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	address: string;
	isEmailVerified: boolean;
	isSuspended: boolean;
}
