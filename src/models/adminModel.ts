import mongoose, { model } from 'mongoose';
import { IAdmin } from '../interfaces/IAdmin';

const adminSchema = new mongoose.Schema<IAdmin>(
	{
		fullname: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		confirmPassword: { type: String },
		phone: { type: String, required: false },
		address: { type: String, required: false },
		isMain: { type: Boolean, default: false },
		isSuspended: { type: Boolean, default: false }
	},
	{
		timestamps: true
	}
);

export default model<IAdmin>('Admin', adminSchema);
