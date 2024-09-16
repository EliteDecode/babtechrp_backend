//1. Add User
//2. Get User
//3. Get Student by Id
//4. Update Student
//5. Delete Student

import { IBstUserIds } from '../interfaces/IBstUserIds';
import { IParams } from '../interfaces/IParams';
import BstUserIds from '../models/bstUserIdsModel';

export const add_Bst_User_id = async (params: { data: IBstUserIds; admin: { id: string }; query: any }) => {
	try {
		const userData = params.data;
		const checkIfUserExists = await BstUserIds.findOne({
			$or: [{ phone: userData.phone }, { email: userData.email }]
		});

		if (checkIfUserExists) throw new Error('User already exists with the provided information');

		const user = await BstUserIds.create({ ...userData, isIdUsed: false });

		return {
			success: true,
			message: 'User added successfully',
			data: user
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const get_bst_user_ids = async () => {
	try {
		const users = await BstUserIds.find();
		return {
			success: true,
			message: 'Users fetched successfully',
			data: users
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const get_single_bst_user_id = async (params: IParams) => {
	try {
		const { userId } = params.query;
		const student = await BstUserIds.findById(userId);

		if (!student) throw new Error('User not found');

		return {
			success: true,
			message: 'User fetched successfully',
			data: student
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const update_single_bst_user_id = async (params: { data: IBstUserIds; query: any }) => {
	try {
		const { userId } = params.query;
		const userData = params.data;

		const checkUser = await BstUserIds.findById(userId);
		if (!checkUser) throw new Error('User not found');
		if (checkUser.isIdUsed) throw new Error('User already used the generated Id and so the phone and email cannot be changed again');

		const updateUser = await BstUserIds.findByIdAndUpdate(userId, userData, { new: true });

		if (!updateUser) throw new Error('Error updating student');

		return {
			success: true,
			message: 'User updated successfully',
			data: updateUser
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const delete_single_bst_user_id = async (params: IParams) => {
	try {
		const { userId } = params.query;

		const fetchUser = await BstUserIds.findById(userId);
		if (!fetchUser) throw new Error('Student not found');

		if (fetchUser.isIdUsed) throw new Error('User already used the generated Id and so cannot delete ID');
		await BstUserIds.findByIdAndDelete(userId);
		return {
			success: true,
			message: 'User deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
