import jwtUtils from '../utils/jwtUtils';
import userModel from '../models/userModel';
import tokenModel from '../models/tokenModel';
import bcrypt from 'bcrypt';
import { IUser } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';

export const register = async (userData: IUser) => {
	const existingUser = await userModel.findOne({ email: userData.email });
	if (existingUser) {
		throw new Error('User already exists');
	}

	userData.password = await bcrypt.hash(userData.password, 10);
	const user = await userModel.create(userData);
	const tokens = jwtUtils.generateTokens(user);
	return { ...user.toObject(), ...tokens };
};

export const login = async ({ email, password }: { email: string; password: string }) => {
	const user = await userModel.findOne({ email });
	if (!user) {
		throw new Error('User not found');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	const tokens = jwtUtils.generateTokens(user);
	return tokens;
};

export const verifyEmail = async (token: string) => {
	// Verify email logic using the token
	const decoded = jwtUtils.verifyToken(token) as JwtPayload & { id: string };

	// Handle case where `id` might not exist
	if (!decoded || typeof decoded === 'string' || !decoded.id) {
		throw new Error('Invalid token');
	}

	const user = await userModel.findById(decoded.id);
	if (!user) {
		throw new Error('User not found');
	}

	user.isEmailVerified = true;
	await user.save();
};

export const refreshToken = async (refreshToken: string) => {
	const newTokens = jwtUtils.refreshTokens(refreshToken);
	return newTokens;
};
