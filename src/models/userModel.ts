import mongoose, { model } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const userSchema = new mongoose.Schema<IUser>(
	{
		fullname: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		confirmPassword: { type: String, required: true },
		phone: { type: String, required: false },
		address: { type: String, required: false },
		isEmailVerified: { type: Boolean, default: false },
		isSuspended: { type: Boolean, default: false }
	},
	{
		timestamps: true
	}
);

export default model<IUser>('User', userSchema);
