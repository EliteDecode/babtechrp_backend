import { handleRequest } from '../helpers/handleRequest';
import {
	change_user_email,
	change_user_password,
	delete_user_account,
	fetch_user_details,
	update_user_details,
	verify_user_email
} from '../services/userServices';

export const fetchUser = handleRequest(fetch_user_details);
export const updateUser = handleRequest(update_user_details);
export const changeUserEmail = handleRequest(change_user_email);
export const verifyEmail = handleRequest(verify_user_email);
export const changePassword = handleRequest(change_user_password);
export const deleteUser = handleRequest(delete_user_account);
