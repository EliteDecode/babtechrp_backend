import { handleRequest } from '../helpers/handleRequest';
import {
	admin_fetch_user_single_withdrawal,
	admin_fetch_user_withdrawals,
	approve_withdrawal,
	decline_withdrawal,
	fetch_user_withdrawals,
	request_withdrawal
} from '../services/withdrawalServices';

export const fetchUserWithdrawals = handleRequest(fetch_user_withdrawals);
export const requestWithdrawal = handleRequest(request_withdrawal);

//admin
export const fetchAllUserWithdrawals = handleRequest(admin_fetch_user_withdrawals);
export const fetchUserSingleWithdrawal = handleRequest(admin_fetch_user_single_withdrawal);
export const approveWithdrawal = handleRequest(approve_withdrawal);
export const declineWithdrawal = handleRequest(decline_withdrawal);
