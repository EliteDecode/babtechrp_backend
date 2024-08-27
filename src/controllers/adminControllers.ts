import {
	update_sub_admin,
	delete_sub_admin,
	login_Admin,
	create_SubAdmin,
	suspend_SubAdmin,
	logout_admin,
	fetch_admin_details,
	get_access_token
} from '../services/adminServices';
import { handleRequest } from '../helpers/handleRequest';
import {
	fetch_all_referrals,
	fetch_all_users,
	fetch_single_referral,
	fetch_single_user,
	toggle_suspend_user_account
} from '../services/adminUserServices';

export const loginAdmin = handleRequest(login_Admin);
export const createSubAdmin = handleRequest(create_SubAdmin);
export const updateSubAdmin = handleRequest(update_sub_admin);
export const deleteSubAdmin = handleRequest(delete_sub_admin);
export const suspendSubAdmin = handleRequest(suspend_SubAdmin);
export const fetchAdmin = handleRequest(fetch_admin_details);
export const logoutAdmin = handleRequest(logout_admin);
export const requestAccessToken = handleRequest(get_access_token);

//Admin Users
export const fetchAllUsers = handleRequest(fetch_all_users);
export const fetchSingleUser = handleRequest(fetch_single_user);
export const toggleSuspendAccount = handleRequest(toggle_suspend_user_account);

export const fetchAllReferrals = handleRequest(fetch_all_referrals);
export const fetchSingleReferral = handleRequest(fetch_single_referral);
