import jwtUtils from '../utils/jwtUtils';
import User from '../models/userModel';
import tokenModel from '../models/tokenModel';
import bcrypt from 'bcrypt';
import { IUser, IUserLogin } from '../interfaces/IUser';
import { JwtPayload } from 'jsonwebtoken';
import sendMail from '../utils/emailUtils';
import authTokenModel from '../models/authTokenModel';
import { cleanupTokensAfterFailedEmailMessage } from '../helpers/cleanUpExpiredUser';
import { IToken } from '../interfaces/IToken';
import { generateReferralNumber } from '../helpers/generateReferralCode';

export const register_user = async (params: { data: IUser; user: IUser }) => {
	try {
		// Extract user data from req.body
		const userData = params.data as IUser;

		// Check if the user already exists
		const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
		if (existingUser) {
			// Check if there is an existing valid auth code
			const getAuthCode = await authTokenModel.findOne({
				userId: existingUser._id,
				expiresAt: { $gt: new Date() }
			});
			if (getAuthCode) {
				throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
			}
			throw new Error('User with this email already exists. Please login or use a different email.');
		}

		// Hash the user's password
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		// Create a new user
		const newUser = new User({
			...userData,
			email: userData.email.toLowerCase(),
			password: hashedPassword,
			isEmailVerified: false,
			isSuspended: false,
			phone: null,
			address: null,
			referralCode: generateReferralNumber()
		});

		try {
			await newUser.save();
			// Generate a 5-digit verification code
			const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
			const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

			// Store the verification code in the authTokenModel
			await authTokenModel.create({
				userId: newUser._id,
				authCode: hashedVerificationCode,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
			});
			// Send verification email using Nodemailer
			await sendMail({
				email: newUser.email,
				subject: 'Verify Your Email',
				text: `Your verification code is: ${verificationCode}`
			});
		} catch (emailError: any) {
			// Cleanup tokens if email sending fails
			await cleanupTokensAfterFailedEmailMessage({ id: newUser._id as string });
			throw new Error(`Error sending verification email: ${emailError.message}`);
		}

		// Remove sensitive fields before returning user data
		const { password, confirmPassword, ...userWithoutPassword } = newUser.toObject();

		return {
			success: true,
			message: 'User registered successfully. Please verify your email using the code sent to your email.',
			data: userWithoutPassword
		};
	} catch (error: any) {
		throw new Error(`Error registering user ${error.message}`);
	}
};

export const verify_user_token = async (params: { data: IToken }) => {
	try {
		const userAuthInfo: IToken = params.data;

		const fetchUserToken = await authTokenModel.findOne({
			userId: userAuthInfo.userId,
			expiresAt: { $gt: new Date() }
		});

		if (!fetchUserToken || !fetchUserToken.authCode) {
			throw new Error('Verification code is incorrect');
		}

		const isMatch = userAuthInfo.authCode && (await bcrypt.compare(userAuthInfo.authCode, fetchUserToken.authCode));
		if (!isMatch) {
			throw new Error('Invalid or expired verification code');
		}

		const updateUser = await User.findByIdAndUpdate(fetchUserToken.userId, { isEmailVerified: true }, { new: true });

		await authTokenModel.findByIdAndDelete(fetchUserToken._id);

		return {
			success: true,
			message: 'Email successfully verified',
			data: updateUser
		};
	} catch (error: any) {
		throw new Error(`Error verifying user token: ${error.message}`);
	}
};

export const login_user = async (params: { data: IUserLogin }) => {
	const { email, password } = params.data;

	// Find the user by email
	const user = await User.findOne({ email: email.toLowerCase() });

	if (!user) {
		throw new Error('User not found');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	const tokens = jwtUtils.generateTokens(user);

	// Set refresh token expiration to 30 days
	const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
	const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

	try {
		await tokenModel.create({
			userId: user._id,
			refreshToken: tokens.refreshToken,
			expiresAt: expiresAt
		});
		return {
			success: true,
			message: 'Login successful',
			data: {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken
			}
		};
	} catch (error: any) {
		throw new Error(`Error logging in, please try again`);
	}
};
export const logout_user = async (params: { data: { refreshToken: string } }) => {
	const { refreshToken } = params.data;

	try {
		const result = await tokenModel.findOneAndDelete({ refreshToken });

		if (!result) {
			throw new Error('Refresh token not found');
		}

		return {
			success: true,
			message: 'Logout successful',
			data: null
		};
	} catch (error: any) {
		throw new Error(`Error logging out user: ${error.message}`);
	}
};

export const forgot_password = async (params: { data: { email: string } }) => {
	const { email } = params.data;

	const fetchUser = await User.findOne({ email: email.toLowerCase() });
	const checkUserWithToken = await authTokenModel.findOne({ userId: fetchUser?._id });

	if (!fetchUser) {
		throw new Error('User not found');
	}

	if (checkUserWithToken) {
		throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
	}

	try {
		const resetToken = jwtUtils.generateResetToken(fetchUser);
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

		await sendMail({
			email: fetchUser.email,
			subject: 'Password Reset Request',
			text: `You are receiving this email because you (or someone else) has requested a password reset. Please click on the following link to reset your password: ${resetUrl}`
		});

		await authTokenModel.create({
			userId: fetchUser._id,
			authCode: resetToken,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		});
		return {
			success: true,
			message: 'Password reset email sent successfully',
			data: resetToken
		};
	} catch (error) {
		await cleanupTokensAfterFailedEmailMessage({ id: fetchUser._id as string });
		throw new Error(`Error sending password reset email: ${error}`);
	}
};

export const reset_password = async (params: any) => {
	const { password, confirmPassword } = params.data;
	const { id } = params.user;

	const fetchUser = await User.findById(id);

	if (!fetchUser) {
		throw new Error('UnAuthorized');
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await User.findByIdAndUpdate(id, { password: hashedPassword });
		return {
			success: true,
			message: 'Password reset successful',
			data: null
		};
	} catch (error) {
		throw new Error(`Error resetting password: ${error}`);
	}
};
