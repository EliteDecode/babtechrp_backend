//1. Regsiter User
//2. Verify User
//3. Login User
//4. Logout
//5. Forgot Password
//6. Reset Password

import jwtUtils from '../utils/jwtUtils';
import User from '../models/userModel';
import tokenModel from '../models/tokenModel';
import bcrypt from 'bcrypt';
import sendMail from '../utils/emailUtils';
import authTokenModel from '../models/authTokenModel';
import { cleanupTokensAfterFailedEmailMessage } from '../helpers/cleanUpExpiredUser';
import { IToken } from '../interfaces/IToken';
import { generateReferralNumber } from '../helpers/generateReferralCode';
import { IParams } from '../interfaces/IParams';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../interfaces/IUser';
import walletModel from '../models/walletModel';

export const register_user = async (params: IParams) => {
	try {
		// Extract user data from req.body
		const userData = params.data;

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
			fullname: userData.fullname,
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
				text: `
        <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
            <h2 style="color: #007BFF;">Email Verification</h2>
            <p>Your verification code is:</p>
            <p style="font-size: 24px; font-weight: bold; color: #000;">${verificationCode}</p>
            <p>Please enter this code to verify your email address.</p>
            <br/>
            <p>Thank you!</p>
        </div>
    `
			});
		} catch (emailError: any) {
			// Cleanup tokens if email sending fails
			await cleanupTokensAfterFailedEmailMessage({ id: newUser._id as string });
			throw new Error(`Error sending verification email: ${emailError.message}`);
		}

		return {
			success: true,
			message: 'User registered successfully. Please verify your email using the code sent to your email.',
			data: { _id: newUser._id, email: newUser.email }
		};
	} catch (error: any) {
		throw new Error(`Error registering user ${error.message}`);
	}
};

export const verify_user_token = async (params: { data: IToken; query: { userId: string } }) => {
	try {
		const userAuthInfo = params.data;
		const { userId } = params.query;

		const fetchUserToken = await authTokenModel.findOne({
			userId: userId,
			expiresAt: { $gt: new Date() }
		});

		if (!fetchUserToken || !fetchUserToken.authCode) {
			throw new Error('Verification code is incorrect');
		}

		const isMatch = userAuthInfo.authCode && (await bcrypt.compare(userAuthInfo.authCode.toString(), fetchUserToken.authCode));
		if (!isMatch) {
			throw new Error('Invalid or expired verification code');
		}

		const updateUser = await User.findByIdAndUpdate(fetchUserToken.userId, { isEmailVerified: true }, { new: true });
		const newWallet = new walletModel({
			userId: userId,
			total: 0,
			withdrawn: 0,
			balance: 0,
			transactions: []
		});
		await newWallet.save();

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

export const login_user = async (params: IParams) => {
	const { email, password } = params.data;

	const user = await User.findOne({ email: email.toLowerCase() });

	if (!user) {
		throw new Error('User not found');
	}

	if (user.isSuspended) {
		throw new Error('Your account has been suspended');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	const tokens = jwtUtils.generateTokens(user);

	try {
		const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
		const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

		const checkExistingTokens = await tokenModel.findOne({ userId: user._id });

		if (checkExistingTokens) {
			await tokenModel.findOneAndUpdate({ userId: user._id }, { refreshToken: tokens.refreshToken, expiresAt: expiresAt });
		} else {
			await tokenModel.create({ userId: user._id, refreshToken: tokens.refreshToken, expiresAt: expiresAt });
		}

		return {
			success: true,
			message: 'Login successful',
			data: {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken
			}
		};
	} catch (error: any) {
		throw new Error('Error logging in, please try again');
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

export const forgot_password = async (params: IParams) => {
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
		const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

		await sendMail({
			email: fetchUser.email,
			subject: 'Password Reset Request',
			text: `
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p>Please click on the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-align: center; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
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

export const reset_password = async (params: { data: { password: string; token: string } }) => {
	const { password, token } = params.data;

	const decoded = jwtUtils.verifyToken(token) as JwtPayload;

	const fetchUser = await User.findById(decoded.id);

	if (!fetchUser) {
		throw new Error('UnAuthorized');
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
		return {
			success: true,
			message: 'Password reset successful',
			data: null
		};
	} catch (error) {
		throw new Error(`Error resetting password: ${error}`);
	}
};

export const get_access_token = async (params: { data: IToken }) => {
	try {
		const token = params.data;

		const checkExistingTokens = await tokenModel.findOne({ refreshToken: token.refreshToken });

		if (!checkExistingTokens) {
			throw new Error('Invalid refresh token');
		}

		const decoded = jwtUtils.verifyRefreshToken(token.refreshToken) as JwtPayload & { id: IUser['_id'] };
		if (!decoded) {
			throw new Error('Invalid refresh token');
		}
		const user = await User.findById(decoded.id);

		const tokens = jwtUtils.generateTokens(user as IUser);
		const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;

		await tokenModel.findOneAndUpdate(
			{ userId: user?._id },
			{ refreshToken: tokens.refreshToken, expiresAt: new Date(Date.now() + refreshTokenExpiresIn) }
		);

		return {
			success: true,
			message: 'Access token refreshed successfully',
			data: {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken
			}
		};
	} catch (error) {
		throw new Error(`Error refreshing access token: ${error}`);
	}
};
