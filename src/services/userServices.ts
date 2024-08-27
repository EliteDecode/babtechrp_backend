//1. fetch user details
//2. update user details
//3. change email
//4. confirm change of email
//5. chnage password
//6. delete Account

import { IParams } from '../interfaces/IParams';
import { IChangePassword, IUpdateUser, IUser } from '../interfaces/IUser';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import sendMail from '../utils/emailUtils';
import authTokenModel from '../models/authTokenModel';
import { IToken } from '../interfaces/IToken';
import tokenModel from '../models/tokenModel';

export const fetch_user_details = async (params: IParams) => {
	try {
		const { id } = params.user;

		const fetchUser = await User.findById(id).select('-password');

		if (!fetchUser) {
			throw new Error('User not found');
		}

		return {
			success: true,
			message: 'User details fetched successfully',
			data: fetchUser
		};
	} catch (error: any) {
		throw new Error(`${error.message}`);
	}
};

export const update_user_details = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId } = params.query;
		const userData = params.data;
		if (userId !== id) {
			throw new Error('You are not authorized to update this user');
		}
		const checkUser = await User.findById(id);

		if (!checkUser) {
			throw new Error('User not found');
		}

		if (userData.email) {
			throw new Error('Email cannot be updated');
		}
		const updateUser = await User.findByIdAndUpdate(id, { ...userData, isProfileUpdated: true }, { new: true }).select('-password');
		if (!updateUser) {
			throw new Error('User not found');
		}
		return {
			success: true,
			message: 'User details updated successfully',
			data: updateUser
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const change_user_email = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { email } = params.data;
		const { userId } = params.query;

		const checkUser = await User.findOne({ email });
		const checkExistingToken = await authTokenModel.findOne({ userId: userId });

		if (userId !== id) {
			throw new Error('You are not authorized to update this user');
		}

		if (checkUser) {
			throw new Error('Email already exists');
		}

		if (checkExistingToken) {
			throw new Error('Verification code already sent to your email');
		}

		const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
		const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

		await authTokenModel.create({
			userId: userId,
			newEmail: email,
			authCode: hashedVerificationCode,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
		});
		// Send verification email using Nodemailer
		await sendMail({
			email: email,
			subject: 'Verify Your Email',
			text: `Your verification code is: ${verificationCode}`
		});

		return {
			success: true,
			message: 'Verification code sent to your email',
			data: null
		};
	} catch (error) {
		throw new Error(` ${error}`);
	}
};

export const verify_user_email = async (params: { data: IToken; user: { id: string }; query: { userId: string } }) => {
	try {
		const { id } = params.user;
		const { userId } = params.query;

		const userAuthInfo = params.data;

		if (id !== userId) {
			throw new Error('You are not authorized to verify this user');
		}

		const fetchUserToken = await authTokenModel.findOne({
			userId: userId,
			expiresAt: { $gt: new Date() }
		});

		if (!fetchUserToken || !fetchUserToken.authCode) {
			throw new Error('The verification code you entered is incorrect or has expired. Please try again');
		}

		const isMatch = userAuthInfo.authCode && (await bcrypt.compare(userAuthInfo.authCode.toString(), fetchUserToken.authCode));
		if (!isMatch) {
			throw new Error('Invalid or expired verification code');
		}

		const updateUser = await User.findByIdAndUpdate(fetchUserToken.userId, { email: fetchUserToken.newEmail }, { new: true });

		await authTokenModel.findByIdAndDelete(fetchUserToken._id);

		return {
			success: true,
			message: 'Email successfully verified',
			data: updateUser
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const change_user_password = async (params: { data: IChangePassword; user: { id: string }; query: { userId: string } }) => {
	try {
		const { userId } = params.query;
		const { id } = params.user;
		const { oldPassword, newPassword } = params.data;

		if (userId !== id) {
			throw new Error('You are not authorized to change this password');
		}

		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			throw new Error('Invalid old password');
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();
		return {
			success: true,
			message: 'Password updated successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const delete_user_account = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId } = params.query;

		if (userId !== id) {
			throw new Error('You are not authorized to delete this user');
		}
		const checkUser = await User.findById(id);

		if (!checkUser) {
			throw new Error('User not found');
		}

		await User.findByIdAndDelete(id);
		await tokenModel.findOneAndDelete({ userId: userId });

		return {
			success: true,
			message: 'User deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};
