import { handleRequest } from '../helpers/handleRequest';
import {
	add_Bst_User_id,
	delete_single_bst_user_id,
	get_bst_user_ids,
	get_single_bst_user_id,
	update_single_bst_user_id
} from '../services/bstUserIdsServices';

export const addBstUserId = handleRequest(add_Bst_User_id);
export const getBstUserIds = handleRequest(get_bst_user_ids);
export const geSingleBstUserId = handleRequest(get_single_bst_user_id);
export const updateBstUserId = handleRequest(update_single_bst_user_id);
export const deleteBstUserId = handleRequest(delete_single_bst_user_id);
