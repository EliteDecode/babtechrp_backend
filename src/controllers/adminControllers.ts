import {
	update_sub_admin,
	delete_sub_admin,
	login_Admin,
	create_SubAdmin,
	suspend_SubAdmin,
	logout_admin,
	fetch_admin_details
} from '../services/adminServices';
import { handleRequest } from '../helpers/handleRequest';

export const loginAdmin = handleRequest(login_Admin);
export const createSubAdmin = handleRequest(create_SubAdmin);
export const updateSubAdmin = handleRequest(update_sub_admin);
export const deleteSubAdmin = handleRequest(delete_sub_admin);
export const suspendSubAdmin = handleRequest(suspend_SubAdmin);
export const fetchAdmin = handleRequest(fetch_admin_details);
export const logoutAdmin = handleRequest(logout_admin);
