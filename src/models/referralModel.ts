import mongoose from 'mongoose';
import { IReferal } from '../interfaces/IReferal';

const ReferralModel = new mongoose.Schema<IReferal>(
	{
		referralCode: {
			type: String,
			required: true
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

export default mongoose.model('Referral', ReferralModel);
