import mongoose, { model } from 'mongoose';
import { IWallet, IWithdrawal } from '../interfaces/IWallet';

const withdrawalSchema = new mongoose.Schema<IWithdrawal>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		date: { type: Date, default: Date.now },
		amount: { type: Number, default: 0 },
		status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }
	},
	{
		timestamps: true
	}
);

export default model('Withdrawal', withdrawalSchema);
