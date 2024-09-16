import { Document } from 'mongoose';

export interface IBstUserIds extends Document {
	fullname: string;
	email: string;
	phone: string;
	bstId: string;
	isIdUsed: boolean;
}

// export interface IUpdateUser extends Document {
// 	fullname?: string;
// 	phone?: string;
// 	address?: string;
// 	bstId?: string;
// }

// export interface IChangePassword {
// 	newPassword: string;
// 	confirmNewPassword: string;
// 	oldPassword: string;
// }

// export interface IUserLogin extends Document {
// 	email: string;
// 	password: string;
// }
