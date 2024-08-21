//1. fetch wallet
//2. Withdrawal Request.

import { IParams } from '../interfaces/IParams';
import { IWithdrawal } from '../interfaces/IWallet';
import User from '../models/userModel';
import Wallet from '../models/walletModel';
import Withdrawal from '../models/withdrawalModel';

export const request_withdrawal = async (params: { data: IWithdrawal; user: { id: string } }) => {
	try {
		const { id } = params.user;
		const withdrawalData = params.data;

		const fetchWallet = await Wallet.findOne({ userId: id });
		if (!fetchWallet) throw new Error('Wallet not found, withdrawal cant go through');

		if (withdrawalData.amount > fetchWallet.total) throw new Error('Insufficient funds');
		const withdrawals: IWithdrawal = await Withdrawal.create({
			userId: id,
			date: new Date(),
			status: 'pending',
			amount: withdrawalData.amount
		});

		return {
			success: true,
			message: 'Withdrawl Placed successfully',
			data: withdrawals
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const fetch_user_withdrawals = async (params: IParams) => {
	try {
		const { id } = params.user;
		const withdrawals = await Withdrawal.find({ userId: id });

		if (!withdrawals) throw new Error('No withdrawals found');

		return {
			success: true,
			message: 'Fetched all withdrawals successfully ',
			data: withdrawals
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

//Admin

export const admin_fetch_user_withdrawals = async (params: IParams) => {
	try {
		const withdrawals = await Withdrawal.find();

		return {
			success: true,
			message: 'Withdrawals fetched successfully',
			data: withdrawals
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const admin_fetch_user_single_withdrawal = async (params: IParams) => {
	try {
		const { withdrawalId } = params.query;
		const withdrawal = await Withdrawal.findById(withdrawalId);
		if (!withdrawal) throw new Error('Withdrawal details not found');
		const fetchUser = await User.findById(withdrawal.userId);
		return {
			success: true,
			message: 'Withdrawal fetched successfully',
			data: {
				withdrawal,
				user: fetchUser
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const approve_withdrawal = async (params: IParams) => {
	try {
		const { withdrawalId } = params.query;

		const fetchWithdrawal = await Withdrawal.findById(withdrawalId);
		if (!fetchWithdrawal) throw new Error('Withdrawal details not found');
		if (fetchWithdrawal.status == 'approved') throw new Error('Withdrawal has already been approved');
		if (fetchWithdrawal.status == 'declined') throw new Error('Withdrawal has already been declined');
		const fetchWallets = await Wallet.findOne({ userId: fetchWithdrawal?.userId });

		fetchWithdrawal.status = 'approved';
		fetchWallets!.total = fetchWallets!.total - fetchWithdrawal.amount;
		fetchWallets!.withdrawn = fetchWallets!.withdrawn + fetchWithdrawal.amount;
		fetchWallets!.transactions.push({
			amount: fetchWithdrawal.amount,
			date: new Date(),
			type: 'debit'
		});
		await fetchWithdrawal.save();
		await fetchWallets!.save();

		return {
			success: true,
			message: 'Withdrawal approved successfully',
			data: {
				fetchWithdrawal
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const decline_withdrawal = async (params: IParams) => {
	try {
		const { withdrawalId } = params.query;

		const fetchWithdrawal = await Withdrawal.findById(withdrawalId);
		if (!fetchWithdrawal) throw new Error('Withdrawal details not found');
		if (fetchWithdrawal.status == 'declined') throw new Error('Withdrawal has already been declined');
		if (fetchWithdrawal.status == 'approved') throw new Error('Withdrawal has already been approved');
		fetchWithdrawal.status = 'declined';

		await fetchWithdrawal.save();

		return {
			success: true,
			message: 'Withdrawal declined successfully',
			data: {
				fetchWithdrawal
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
