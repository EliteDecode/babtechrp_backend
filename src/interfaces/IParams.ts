import { IUser } from './IUser';
import { IAdmin } from './IAdmin';
import { IStudent } from './IStudent';

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
