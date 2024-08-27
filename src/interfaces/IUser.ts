import { Document } from 'mongoose';

export interface IUser extends Document {
	fullname: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone?: string;
	address?: string;
	isEmailVerified?: boolean;
	isProfileUpdated?: boolean;
	isSuspended?: boolean;
	referralCode?: string;
}

export interface IUpdateUser extends Document {
	fullname?: string;
	phone?: string;
	address?: string;
}

export interface IChangePassword {
	newPassword: string;
	confirmNewPassword: string;
	oldPassword: string;
}

export interface IUserLogin extends Document {
	email: string;
	password: string;
}
