import { Document, Types } from 'mongoose';

export interface IToken extends Document {
	userId?: Types.ObjectId;
	adminId?: Types.ObjectId;
	refreshToken: string;
	expiresAt?: Date;
	authCode?: string;
	newEmail?: string;
}
