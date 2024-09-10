import { IAdmin } from './IAdmin';
import { IUser } from './IUser';

export interface IParams {
	data: IUser | IAdmin;
	user: {
		id: string;
	};
	query: any;
	admin: {
		id: string;
	};
}
