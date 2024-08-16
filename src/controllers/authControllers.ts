import { handleRequest } from '../helpers/handleRequest';
import { forgot_password, login_user, logout_user, register_user, reset_password, verify_user_token } from '../services/authServices';

// Exporting controllers using the higher-order function
export const registerUser = handleRequest(register_user);
export const verifyUserToken = handleRequest(verify_user_token);
export const loginUser = handleRequest(login_user);
export const logoutUser = handleRequest(logout_user);
export const forgotPassword = handleRequest(forgot_password);
export const resetPassword = handleRequest(reset_password);
