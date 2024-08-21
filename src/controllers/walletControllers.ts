import { handleRequest } from '../helpers/handleRequest';
import { admin_fetch_single_user_wallet, admin_fetch_user_wallet, fetch_user_wallet } from '../services/walletServices';

export const fetchUserWallet = handleRequest(fetch_user_wallet);

//admin
export const fetchAllUserWallet = handleRequest(admin_fetch_user_wallet);
export const fetchSingleUserWallet = handleRequest(admin_fetch_single_user_wallet);
