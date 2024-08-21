//1. get all users
//2. get single user
//3. suspend user account

import Referrals from '../models/referralModel';
import tokenModel from '../models/tokenModel';
import User from '../models/userModel';

export const fetch_all_users = async () => {
	try {
		const users = await User.find().select('-password');
		return {
			success: true,
			message: 'Users fetched successfully',
			data: users
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const fetch_single_user = async (params: { query: { userId: string } }) => {
	try {
		const { userId } = params.query;
		const user = await User.findById(userId).select('-password');
		if (!user) {
			throw new Error('User not found');
		}
		const fetchReferals = await Referrals.find({ refferedBy: userId }).select('-password');
		return {
			success: true,
			message: 'User fetched successfully',
			data: {
				user,
				referrals: fetchReferals
			}
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const toggle_suspend_user_account = async (params: { query: { userId: string } }) => {
	try {
		const { userId } = params.query;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}
		user.isSuspended = !user.isSuspended;
		await tokenModel.findOneAndDelete({ userId: userId });
		const suspendedUser = await user.save();
		return {
			success: true,
			message: suspendedUser.isSuspended ? 'User account suspended successfully' : 'User account activated successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

//Referalls

export const fetch_all_referrals = async () => {
	try {
		const referrals = await Referrals.find();
		return {
			success: true,
			message: 'Referrals fetched successfully',
			data: referrals
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};

export const fetch_single_referral = async (params: { query: { referralId: string } }) => {
	try {
		const { referralId } = params.query;
		const referral = await Referrals.findById(referralId);
		if (!referral) {
			throw new Error('Referral not found');
		}
		return {
			success: true,
			message: 'Referral fetched successfully',
			data: referral
		};
	} catch (error: any) {
		throw new Error(` ${error.message}`);
	}
};
