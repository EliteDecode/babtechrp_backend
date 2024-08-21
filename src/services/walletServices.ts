//1. fetch wallet
//2. Withdrawal Request.

import { IParams } from '../interfaces/IParams';
import User from '../models/userModel';
import Wallet from '../models/walletModel';

export const fetch_user_wallet = async (params: IParams) => {
	try {
		const { id } = params.user;

		const wallet = await Wallet.findOne({ userId: id });
		const fetchUser = await User.findById(id);
		if (!wallet) throw new Error('Wallet not found');

		return {
			success: true,
			message: 'Wallet fetched successfully',
			data: {
				wallet,
				user: fetchUser
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

//Admin

export const admin_fetch_user_wallet = async (params: IParams) => {
	try {
		const wallets = await Wallet.find();
		// const walletsWithUserDetails = [];

		// for (const wallet of wallets) {
		// 	const user = await User.findById(wallet.userId).select('-password -otherSensitiveFields');
		// 	if (user) {
		// 		walletsWithUserDetails.push({
		// 			wallet,
		// 			user
		// 		});
		// 	}
		// }

		return {
			success: true,
			message: 'Wallets fetched successfully',
			data: wallets
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const admin_fetch_single_user_wallet = async (params: IParams) => {
	try {
		const { walletId } = params.query;

		const wallet = await Wallet.findById(walletId);
		if (!wallet) throw new Error('Wallet not found');
		const fetchUser = await User.findById(wallet.userId);

		return {
			success: true,
			message: 'Wallet fetched successfully',
			data: {
				wallet,
				user: fetchUser
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
