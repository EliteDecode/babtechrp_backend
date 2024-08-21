// Admin Login
// Create Admin
// Update Admin
// Delete Admin
// Suspend Admin

import bcrypt from 'bcrypt';
import jwtUtils from '../utils/jwtUtils';
import Admin from '../models/adminModel';
import { IAdminLogin } from '../interfaces/IAdmin';
import { IParams } from '../interfaces/IParams';
import tokenModel from '../models/tokenModel';

export const login_Admin = async (params: { data: IAdminLogin }) => {
	try {
		const { email, password } = params.data;
		const admin = await Admin.findOne({ email });
		if (!admin) {
			throw new Error('Admin not found');
		}

		const isMatch = await bcrypt.compare(password, admin.password);
		if (!isMatch) {
			throw new Error('Invalid credentials');
		}

		const tokens = jwtUtils.generateAdminTokens(admin);
		const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);
		const checkExistingTokens = await tokenModel.findOne({ adminId: admin._id });

		if (checkExistingTokens) {
			await tokenModel.findOneAndUpdate({ userId: admin._id }, { refreshToken: tokens.refreshToken, expiresAt: expiresAt });
		}
		await tokenModel.create({ adminId: admin._id, refreshToken: tokens.refreshToken, expiresAt: expiresAt });
		return {
			success: true,
			message: 'Login successful',
			data: {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken
			}
		};
	} catch (error: any) {
		throw new Error('Error logging in admin' + error.message);
	}
};

export const create_SubAdmin = async (params: IParams) => {
	try {
		const adminData = params.data;

		const { email, password } = adminData;

		const hashedPassword = await bcrypt.hash(password, 10);
		const { confirmPassword, ...adminDataWithoutPassword } = adminData;

		const checkAdminExistence = await Admin.findOne({ email });

		if (checkAdminExistence) {
			throw new Error('Admin already exists');
		}

		const newAdmin = new Admin({
			...adminDataWithoutPassword,
			password: hashedPassword
		});

		await newAdmin.save();
		return {
			success: true,
			message: 'Admin created successfully',
			data: newAdmin
		};
	} catch (error: any) {
		throw new Error('Error creating admin' + error.message);
	}
};

export const suspend_SubAdmin = async (params: IParams) => {
	try {
		const { adminId } = params.query;
		const fetchSubAdmin = await Admin.findById(adminId);
		if (!fetchSubAdmin) {
			throw new Error('Admin not found');
		}

		fetchSubAdmin.isSuspended = true;
		await fetchSubAdmin.save();
		return {
			success: true,
			message: 'Admin suspended successfully',
			data: null
		};
	} catch (error) {
		throw new Error('Error suspending admin');
	}
};
export const update_sub_admin = async (params: IParams) => {
	try {
		const { id } = params.admin;
		const { adminId } = params.query;
		const adminData = params.data;

		const fetchUser = await Admin.findById(id);
		if (!fetchUser) throw new Error('User not found');

		const referral = await Admin.findByIdAndUpdate(adminId, adminData, { new: true });

		return {
			success: true,
			message: 'Admin Updated successfully',
			data: referral
		};
	} catch (error: any) {
		throw new Error('Error updating referral: ' + error.message);
	}
};

export const delete_sub_admin = async (params: IParams) => {
	try {
		const { adminId } = params.query;

		await Admin.findOneAndDelete(adminId);

		return {
			success: true,
			message: 'Admin deleted successfully',
			data: null
		};
	} catch (error: any) {
		throw new Error('Error deleting referral');
	}
};

export const logout_admin = async (params: { data: { refreshToken: string } }) => {
	const { refreshToken } = params.data;

	try {
		const result = await tokenModel.findOneAndDelete({ refreshToken });

		if (!result) {
			throw new Error('Refresh token not found');
		}

		return {
			success: true,
			message: 'Logout successful',
			data: null
		};
	} catch (error: any) {
		throw new Error(`Error logging out user: ${error.message}`);
	}
};

export const fetch_admin_details = async (params: IParams) => {
	try {
		const { id } = params.admin;

		const fetchAdmin = await Admin.findById(id).select('-password');

		if (!fetchAdmin) {
			throw new Error('Admin not found');
		}

		return {
			success: true,
			message: 'Admin details fetched successfully',
			data: fetchAdmin
		};
	} catch (error: any) {
		throw new Error(`Error fetching admin details: ${error.message}`);
	}
};
