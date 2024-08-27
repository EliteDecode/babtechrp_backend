import mongoose, { model } from 'mongoose';
import { IWallet } from '../interfaces/IWallet';

const walletSchema = new mongoose.Schema<IWallet>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		total: { type: Number, default: 0 },
		withdrawn: { type: Number, default: 0 },
		balance: { type: Number, default: 0 },
		transactions: [
			{
				referralName: { type: String },
				referralPhone: { type: String },
				amount: { type: Number },
				type: {
					type: String,
					enum: ['debit', 'credit'], // Define enum values
					required: true
				},
				date: { type: Date, default: Date.now }
			}
		]
	},
	{
		timestamps: true
	}
);

export default model('Wallet', walletSchema);
