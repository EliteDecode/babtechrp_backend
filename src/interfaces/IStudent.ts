import { Document, Types } from 'mongoose';

export interface IStudent extends Document {
	referredBy: Types.ObjectId;
	fullname: string;
	email: string;
	phone: string;
	address: string;
	isMatched: boolean;
	referralCode: string;
	course: string;
}
