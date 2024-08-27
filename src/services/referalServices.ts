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

		const ReferralData = params.data;
		const fetchUser = await User.findById(id).select('-password');
		if (!fetchUser) throw new Error('User not found');

		const checkIfReferralExists = await Referral.findOne({ referredBy: id, phone: ReferralData.phone });
		if (checkIfReferralExists) throw new Error('Referral with this number already exists');

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
		throw new Error(error.message);
	}
};

export const get_referrals = async (params: IParams) => {
	try {
		const { id } = params.user;

		const referrals = await Referral.find({ referredBy: id });
		if (!referrals) throw new Error('No referrals found');

		return {
			success: true,
			message: 'Referrals fetched successfully',
			data: referrals
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const get_single_referral = async (params: IParams) => {
	try {
		const { referralId } = params.query;

		const referral = await Referral.findById(referralId);

		if (!referral) throw new Error('Referral not found');

		return {
			success: true,
			message: 'Referral fetched successfully',
			data: referral
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const update_single_referral = async (params: IParams) => {
	try {
		const { referralId } = params.query;
		const referralData = params.data;

		const fetchReferral = await Referral.findById(referralId);
		if (!fetchReferral) throw new Error('Referral not found');
		if (fetchReferral?.isMatched === true && fetchReferral?.phone !== referralData?.phone) {
			throw new Error('Referral has already been matched, you cannot update the phone number');
		}
		const referral = await Referral.findByIdAndUpdate(referralId, referralData, { new: true });

		if (referral) {
			return {
				success: true,
				message: 'Referral updated successfully',
				data: referral
			};
		}
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const delete_single_referral = async (params: IParams) => {
	try {
		const { referralId } = params.query;

		const fetchReferral = await Referral.findById(referralId);
		if (!fetchReferral) throw new Error('Referral not found');
		if (fetchReferral?.isMatched === true) {
			throw new Error('Referral has already been matched, you cannot delete this referral');
		}
		if (!fetchReferral) throw new Error('Referral not found');

		await Referral.findByIdAndDelete(referralId);

		return {
			success: true,
			message: 'Referral deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error('Error deleting referral');
	}
};
