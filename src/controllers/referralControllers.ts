import { handleRequest } from '../helpers/handleRequest';
import { add_Referral, delete_single_referral, get_referrals, get_single_referral, update_single_referral } from '../services/referalServices';

export const addReferral = handleRequest(add_Referral);
export const getReferral = handleRequest(get_referrals);
export const geSingleReferral = handleRequest(get_single_referral);
export const updateReferral = handleRequest(update_single_referral);
export const deleteReferral = handleRequest(delete_single_referral);
