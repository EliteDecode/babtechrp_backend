import { Schema, model } from 'mongoose';
import { IToken } from '../interfaces/IToken';

const tokenSchema = new Schema<IToken>({
	userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	refreshToken: { type: String, required: true },
	expiresAt: { type: Date, required: true }
});

export default model<IToken>('Token', tokenSchema);
