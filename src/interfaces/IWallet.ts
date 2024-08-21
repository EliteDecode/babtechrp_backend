import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
	userId: Types.ObjectId;
	total: number;
	withdrawn: number;
	transactions: [
		{
			referral?: string;
			amount: number;
			date: Date;
			type: string;
		}
	];
}

export interface IWithdrawal extends Document {
	userId: Types.ObjectId;
	amount: number;
	status: string;
	date: Date;
}
