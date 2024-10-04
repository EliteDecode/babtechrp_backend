import mongoose, { model } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const userSchema = new mongoose.Schema<IUser>(
	{
		fullname: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: false },
		bstId: { type: String, required: false },
		googleId: { type: String, required: false },
		facebookId: { type: String, required: false },
		githubId: { type: String, required: false },
		instagramId: { type: String, required: false },
		username: { type: String, required: false },
		confirmPassword: { type: String },
		phone: { type: String, required: false },
		address: { type: String, required: false },
		isEmailVerified: { type: Boolean, default: false },
		isProfileUpdated: { type: Boolean, default: false },
		isSuspended: { type: Boolean, default: false },
		referralCode: { type: String, required: false }
	},
	{
		timestamps: true
	}
);

export default model<IUser>('User', userSchema);
