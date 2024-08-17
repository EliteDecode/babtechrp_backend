import { IUser } from './IUser';

export interface IParams {
	data: IUser;
	user: {
		id: string;
	};
	query: any;
}
