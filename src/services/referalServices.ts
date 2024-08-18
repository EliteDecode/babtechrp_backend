//1. Add Referrals
//2. Get Referrals
//3. Get Referral by Id
//4. Update Referral
//5. Delete Referral

import { Request, Response } from 'express';
import { IParams } from '../interfaces/IParams';
import User from '../models/userModel';
import Referral from '../models/referralModel';

export const add_Referral = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId } = params.query;

		const ReferralData = params.data;

		if (id !== userId) throw new Error('You are not authorized to perform this action');

		const fetchUser = await User.findById(id).select('-password');
		if (!fetchUser) throw new Error('User not found');

		const checkIfReferralExists = await Referral.findOne({ referredBy: id, phone: ReferralData.phone });
		if (checkIfReferralExists) throw new Error('Referral already exists');

		await Referral.create({
			referredBy: id,
			...ReferralData,
			isMatched: false,
			referralCode: fetchUser.referralCode
		});

		return {
			success: true,
			message: 'Referral added successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error('Error adding referral: ' + error.message);
	}
};

export const get_referrals = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId } = params.query;

		if (id !== userId) throw new Error('You are not authorized to perform this action');

		const fetchUser = await User.findById(id);
		if (!fetchUser) throw new Error('User not found');
		const referrals = await Referral.find({ referredBy: id });

		return {
			success: true,
			message: 'Referrals fetched successfully',
			data: referrals
		};
	} catch (error: any) {
		throw new Error('Error fetching referrals: ' + error.message);
	}
};

export const get_single_referral = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId, referralId } = params.query;

		if (id !== userId) throw new Error('You are not authorized to perform this action');

		const fetchUser = await User.findById(id);
		if (!fetchUser) throw new Error('User not found');

		const referral = await Referral.findById(referralId);

		return {
			success: true,
			message: 'Referral fetched successfully',
			data: referral
		};
	} catch (error: any) {
		throw new Error('Error fetching referral: ' + error.message);
	}
};

export const update_single_referral = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId, referralId } = params.query;
		const referralData = params.data;

		if (id !== userId) throw new Error('You are not authorized to perform this action');

		const fetchUser = await User.findById(id);
		if (!fetchUser) throw new Error('User not found');

		const referral = await Referral.findByIdAndUpdate(referralId, referralData, { new: true });

		return {
			success: true,
			message: 'Referral updated successfully',
			data: referral
		};
	} catch (error: any) {
		throw new Error('Error updating referral: ' + error.message);
	}
};

export const delete_single_referral = async (params: IParams) => {
	try {
		const { id } = params.user;
		const { userId, referralId } = params.query;

		if (id !== userId) {
			throw new Error('You are not authorized to perform this action');
		}

		const fetchUser = await User.findById(id);
		if (!fetchUser) throw new Error('User not found');

		await Referral.findOneAndDelete(referralId);

		return {
			success: true,
			message: 'Referral deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error('Error deleting referral');
	}
};
