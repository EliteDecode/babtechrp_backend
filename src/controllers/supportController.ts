import { handleRequest } from '../helpers/handleRequest';
import { send_Message } from '../services/supportService';

export const sendMessage = handleRequest(send_Message);
