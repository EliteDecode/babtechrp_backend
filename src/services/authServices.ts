import jwtUtils from '../utils/jwtUtils';
import User from '../models/userModel';
import tokenModel from '../models/tokenModel';
import bcrypt from 'bcrypt';
import { IUser } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';
import sendMail from '../utils/emailUtils';

export const register = async (userData: IUser) => {
	const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
	if (existingUser) {
		throw new Error('User already exists');
	}
	await sendMail({
		email: userData.email,
		subject: 'Verify Email',
		text: 'Please verify your email by clicking the link below'
	});
};

// export const login = async ({ email, password }: { email: string; password: string }) => {
// 	const user = await User.findOne({ email });
// 	if (!user) {
// 		throw new Error('User not found');
// 	}

// 	const isPasswordValid = await bcrypt.compare(password, user.password);
// 	if (!isPasswordValid) {
// 		throw new Error('Invalid password');
// 	}

// 	const tokens = jwtUtils.generateTokens(user);
// 	return tokens;
// };

// export const verifyEmail = async (token: string) => {
// 	// Verify email logic using the token
// 	const decoded = jwtUtils.verifyToken(token) as JwtPayload & { id: string };

// 	// Handle case where `id` might not exist
// 	if (!decoded || typeof decoded === 'string' || !decoded.id) {
// 		throw new Error('Invalid token');
// 	}

// 	const user = await User.findById(decoded.id);
// 	if (!user) {
// 		throw new Error('User not found');
// 	}

// 	user.isEmailVerified = true;
// 	await user.save();
// };

// export const refreshToken = async (refreshToken: string) => {
// 	const newTokens = jwtUtils.refreshTokens(refreshToken);
// 	return newTokens;
// };
