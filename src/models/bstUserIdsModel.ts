import mongoose, { model } from 'mongoose';
import { IBstUserIds } from '../interfaces/IBstUserIds';

const bstIdsSchema = new mongoose.Schema<IBstUserIds>(
	{
		fullname: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		bstId: { type: String, required: true },
		phone: { type: String, required: true },
		isIdUsed: { type: Boolean, default: false }
	},
	{
		timestamps: true
	}
);

export default model<IBstUserIds>('BstUserIds', bstIdsSchema);
