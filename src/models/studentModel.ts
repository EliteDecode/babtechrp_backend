import mongoose from 'mongoose';
import { IStudent } from '../interfaces/IStudent';

const StudentModel = new mongoose.Schema<IStudent>(
	{
		referralCode: {
			type: String,
			required: false
		},
		fullname: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		},
		address: {
			type: String,
			required: true
		},
		course: {
			type: String,
			required: true
		},
		isMatched: {
			type: Boolean,
			default: false
		},
		referredBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{
		timestamps: true
	}
);

export default mongoose.model('Student', StudentModel);
