import { handleRequest } from '../helpers/handleRequest';
import {
	forgot_password,
	get_access_token,
	login_user,
	logout_user,
	register_user,
	resend_verification,
	reset_password,
	verify_user_token
} from '../services/authServices';

export const registerUser = handleRequest(register_user);
export const verifyUserToken = handleRequest(verify_user_token);
export const resendVerification = handleRequest(resend_verification);
export const loginUser = handleRequest(login_user);
export const logoutUser = handleRequest(logout_user);
export const forgotPassword = handleRequest(forgot_password);
export const resetPassword = handleRequest(reset_password);
export const requestAccessToken = handleRequest(get_access_token);
