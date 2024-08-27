//1. fetch wallet
//2. Withdrawal Request.

import { IParams } from '../interfaces/IParams';
import { IWithdrawal } from '../interfaces/IWallet';
import User from '../models/userModel';
import Wallet from '../models/walletModel';
import Withdrawal from '../models/withdrawalModel';
import sendMail from '../utils/emailUtils';

export const request_withdrawal = async (params: { data: IWithdrawal; user: { id: string } }) => {
	try {
		const { id } = params.user;
		const withdrawalData = params.data;

		const fetchUser = await User.findById(id);
		if (!fetchUser?.isProfileUpdated) throw new Error('Please update your profile before making a withdrawal');

		//Fetch all pending withdrawals to check so placement wont exceed total.
		const fetchPendingWithdrawalAmount = await Withdrawal.find({ userId: id, status: 'pending' });
		const pendingWithdrawalAmountSum = fetchPendingWithdrawalAmount.reduce((acc, curr) => acc + curr.amount, 0);

		const fetchWallet = await Wallet.findOne({ userId: id });
		if (!fetchWallet) throw new Error('Wallet not found, withdrawal cant go through');

		if (withdrawalData.amount > fetchWallet.balance) throw new Error('Insufficient funds');
		if (pendingWithdrawalAmountSum + withdrawalData.amount > fetchWallet.balance)
			throw new Error('Pending withdrawal amount exceeds available balance');

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
		if (!withdrawals) throw new Error('No withdrawals found');

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

		const withdrawal = await Withdrawal.findById(withdrawalId);
		if (!withdrawal) throw new Error('Withdrawal details not found');
		if (withdrawal.status == 'approved') throw new Error('Withdrawal has already been approved');
		if (withdrawal.status == 'declined') throw new Error('Withdrawal has already been declined');
		const fetchWallets = await Wallet.findOne({ userId: withdrawal?.userId });

		withdrawal.status = 'approved';
		fetchWallets!.balance = fetchWallets!.total - withdrawal.amount;
		fetchWallets!.withdrawn = fetchWallets!.withdrawn + withdrawal.amount;
		fetchWallets!.transactions.push({
			amount: withdrawal.amount,
			date: new Date(),
			type: 'debit'
		});
		await withdrawal.save();
		await fetchWallets!.save();
		const fetchUser = await User.findById(withdrawal.userId);
		if (!fetchUser) throw new Error('User not Found');

		await sendMail({
			email: fetchUser?.email,
			subject: 'Withdrawal Request Approved',
			text: `
				<div style="font-family: Arial, sans-serif; color: #333;">
				<p>Dear ${fetchUser?.fullname},</p>
				<p>Your withdrawal request of <strong>${withdrawal.amount} Naira</strong> has been <strong>approved</strong>.</p>
				<p>Please log in to your account to view the details of your transaction.</p>
				<br/>
				<p>Best regards,</p>
				<p><strong>BST</strong></p>
				</div>
			`
		});

		return {
			success: true,
			message: 'Withdrawal approved successfully',
			data: {
				withdrawal,
				user: fetchUser
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const decline_withdrawal = async (params: IParams) => {
	try {
		const { withdrawalId } = params.query;

		const withdrawal = await Withdrawal.findById(withdrawalId);
		if (!withdrawal) throw new Error('Withdrawal details not found');
		if (withdrawal.status == 'declined') throw new Error('Withdrawal has already been declined');
		if (withdrawal.status == 'approved') throw new Error('Withdrawal has already been approved');
		withdrawal.status = 'declined';

		await withdrawal.save();
		const fetchUser = await User.findById(withdrawal.userId);
		if (!fetchUser) throw new Error('User not Found');

		await sendMail({
			email: fetchUser?.email,
			subject: 'Withdrawal Request Declined',
			text: `
				<div style="font-family: Arial, sans-serif; color: #333;">
				<p>Dear ${fetchUser?.fullname},</p>
				<p>We regret to inform you that your withdrawal request of <strong>${withdrawal.amount} Naira</strong> has been <strong>declined</strong>.</p>
				<p>Please log in to your account for more details or to make another request.</p>
				<br/>
				<p>Best regards,</p>
				<p><strong>BST</strong></p>
				</div>
			`
		});

		return {
			success: true,
			message: 'Withdrawal declined successfully',
			data: {
				withdrawal,
				user: fetchUser
			}
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
