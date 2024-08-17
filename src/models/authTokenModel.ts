import { Schema, model } from 'mongoose';
import { IToken } from '../interfaces/IToken';

const tokenSchema = new Schema<IToken>({
	userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	authCode: { type: String, required: true },
	newEmail: { type: String },
	expiresAt: { type: Date, required: true }
});

export default model<IToken>('AuthToken', tokenSchema);
