import supertest from 'supertest';
import mongoose from 'mongoose';
import { application } from '../../src/app'; // Assuming this initializes your app
import User from '../../src/models/userModel';
import jwtUtils from '../../src/utils/jwtUtils';
import { RequestCustom } from '../../src/types/express';
import { NextFunction, Response } from 'express';
import AuthToken from '../../src/models/authTokenModel';
import bcrypt from 'bcrypt';
import sendMail from '../../src/utils/emailUtils';
import Token from '../../src/models/tokenModel';

const mockedId = new mongoose.Types.ObjectId();
// Mock the necessary modules
jest.mock('../../src/models/userModel.ts');
jest.mock('../../src/utils/emailUtils.ts');
jest.mock('../../src/models/authTokenModel.ts');
jest.mock('../../src/models/tokenModel.ts');
jest.mock('bcrypt');
jest.mock('node-cron', () => ({
	schedule: jest.fn()
}));
jest.mock('../../src/middleware/authHandler.ts', () => (req: RequestCustom, res: Response, next: NextFunction) => {
	req.user = { id: mockedId } as any; // Mock user ID
	next(); // Proceed with the request
});
const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

const mockUser = {
	_id: mockedId,
	fullname: 'Sam Johnstone',
	email: 'sirelite11@gmail.com',
	phone: '07030548630',
	address: '125 Ekenwan road',
	isEmailVerified: true,
	isProfileUpdated: true,
	isSuspended: false,
	referralCode: 12345,
	createdAt: new Date(),
	updatedAt: new Date(),
	__v: 0
};

describe('Test for fetching user details', () => {
	it('should return user when found', async () => {
		// Generate a valid accessToken using your generateTokens function
		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any); // Adjust as needed

		// Mock the User.findById method to simulate chainable .select()
		const mockSelect = jest.fn().mockResolvedValue(mockUser);
		(User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

		// Send request to the protected route with a valid token
		const response = await supertest(application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);

		// Check that the status code and response body are as expected
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('success', true);

		// Ensure the User.findById method was called with the correct ID
		expect(User.findById).toHaveBeenCalledWith(mockedId);
		expect(mockSelect).toHaveBeenCalledWith('-password'); // Ensure .select('-password') was called
	});

	it('should throw error when user not found', async () => {
		(User.findById as jest.Mock).mockResolvedValue(null);

		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

		const response = await supertest(application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);

		expect(User.findById).toHaveBeenCalledWith(mockedId);
	});

	it('should handle all other errors', async () => {
		// Mock User.findById to return an object with the select method that throws an error
		const mockSelect = jest.fn().mockRejectedValue(new Error('Database error'));
		(User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

		// Generate access token with mocked user ID
		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

		// Perform the request
		const response = await supertest(application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);

		// Assert that a 400 status is returned for the error
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Database error');

		// Ensure User.findById and select were called
		expect(User.findById).toHaveBeenCalledWith(mockedId);
		expect(mockSelect).toHaveBeenCalledWith('-password');
	});
});

describe('Test for updating user details', () => {
	// it('should return an error for unauthorized update', async () => {
	// 	const wrongId = new mongoose.Types.ObjectId();

	// 	const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

	// 	const response = await supertest(application).put(`/bst/v1/user/${wrongId}`).set('Authorization', `Bearer ${accessToken}`).send({
	// 		fullname: 'Sam Johnstone'
	// 	});
	// 	expect(response.status).toBe(400);
	// 	expect(response.body).toHaveProperty('success', false);
	// 	expect(response.body).toHaveProperty('message', 'You are not authorized to update this user');

	// 	expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
	// });

	it('should check for user, and throw error for not found', async () => {
		(User.findById as jest.Mock).mockResolvedValue(null);

		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

		const response = await supertest(application).put(`/bst/v1/user/${mockedId}`).set('Authorization', `Bearer ${accessToken}`).send({
			fullname: 'Sam Johnstone'
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'User not found');

		expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
	});

	it('should throw error if email exists in the body to be updated', async () => {
		(User.findById as jest.Mock).mockResolvedValue(mockUser);

		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

		const response = await supertest(application)
			.put(`/bst/v1/user/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ email: 'newemail@example.com' });

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Email cannot be updated');
		expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
	});

	it('update user successfully', async () => {
		const mockSelect = jest.fn().mockResolvedValue(mockUser);
		// Mock findByIdAndUpdate to return an object that has a .select() function
		(User.findByIdAndUpdate as jest.Mock).mockReturnValue({
			select: mockSelect
		});

		const { accessToken } = jwtUtils.generateTokens({ _id: mockedId } as any);

		const response = await supertest(application)
			.put(`/bst/v1/user/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ fullname: 'Sam Johnstone' });

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('success', true);
		expect(response.body).toHaveProperty('message', 'User details updated successfully');

		// Check that findByIdAndUpdate was called with the correct parameters
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockedId, { fullname: 'Sam Johnstone', isProfileUpdated: true }, { new: true });

		// Ensure that .select('-password') was called
		expect(mockSelect).toHaveBeenCalledWith('-password');
	});
});
describe('Change Email', () => {
	it('should return an error if the new email already exists', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(mockUser);

		const response = await supertest(application)
			.post(`/bst/v1/user/update-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				email: 'jamei@gmail.com'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Email already exists');

		expect(User.findOne).toHaveBeenCalledWith({ email: 'jamei@gmail.com' });
	});

	it('should return an error if token matches with any in the database', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);
		(AuthToken.findOne as jest.Mock).mockResolvedValue({ user: mockedId });

		const response = await supertest(application)
			.post(`/bst/v1/user/update-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				email: 'newemail@example.com'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Verification code already sent to your email');

		expect(User.findOne).toHaveBeenCalledWith({ email: 'newemail@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: mockedId });
	});

	it('should create token and send mail', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);
		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);
		(AuthToken.create as jest.Mock).mockResolvedValue({
			userId: mockedId
		});

		(bcrypt.hash as jest.Mock).mockResolvedValue('hashedVerificationCode');
		(sendMail as jest.Mock).mockResolvedValue(true);

		const response = await supertest(application)
			.post(`/bst/v1/user/update-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				email: 'newemail@example.com'
			});

		expect(response.status).toBe(200);
		expect(response.body).toEqual(
			expect.objectContaining({
				success: true,
				message: 'Verification code sent to your email'
			})
		);

		expect(User.findOne).toHaveBeenCalledWith({ email: 'newemail@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: mockedId });
		expect(AuthToken.create).toHaveBeenCalledWith({
			userId: mockedId,
			authCode: 'hashedVerificationCode',
			expiresAt: expect.any(Date),
			newEmail: 'newemail@example.com'
		});
		expect(bcrypt.hash).toHaveBeenCalled();
		expect(sendMail).toHaveBeenCalled();
	});

	it('should handle other errors', async () => {
		(User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
		(AuthToken.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
		(AuthToken.create as jest.Mock).mockRejectedValue(new Error('Database error'));

		(bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Database error'));
		(sendMail as jest.Mock).mockRejectedValue(new Error('Database error'));

		const response = await supertest(application)
			.post(`/bst/v1/user/update-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				email: 'newemail@example.com'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Database error');
	});
});

describe('Verify email', () => {
	it('throw an error if authToken not found', async () => {
		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);

		const response = await supertest(application)
			.put(`/bst/v1/user/verify-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				authCode: '123456'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'The verification code you entered is incorrect or has expired. Please try again');
		expect(AuthToken.findOne).toHaveBeenCalledWith({
			userId: mockedId
		});
	});

	it('should throw an error if verification code doesnt match', async () => {
		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			authCode: '12345'
		});

		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		const response = await supertest(application)
			.put(`/bst/v1/user/verify-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				authCode: '123456'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Invalid or expired verification code');

		expect(AuthToken.findOne).toHaveBeenCalledWith({
			userId: mockedId
		});
		expect(bcrypt.compare).toHaveBeenCalledWith('123456', '12345');
	});

	it('should update user email successfully', async () => {
		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			authCode: 'db-auth-code', // Mock hashed authCode
			newEmail: 'newemail@example.com',
			userId: 'user-id',
			_id: 'token-id'
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
			_id: mockedId,
			fullname: 'Sam Johnstone',
			email: 'newemail@example.com' // Updated email
		});

		(AuthToken.findByIdAndDelete as jest.Mock).mockResolvedValue({});
		const response = await supertest(application)
			.put(`/bst/v1/user/verify-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				authCode: 12345
			});

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('success', true);
		expect(response.body).toHaveProperty('message', 'Email successfully verified');

		expect(AuthToken.findOne).toHaveBeenCalledWith({
			userId: mockedId
		});
		expect(bcrypt.compare).toHaveBeenCalledWith('12345', 'db-auth-code');
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { email: 'newemail@example.com' }, { new: true });
		expect(AuthToken.findByIdAndDelete).toHaveBeenCalledWith('token-id');
	});

	it('should handle other errors', async () => {
		(AuthToken.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

		(bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Database error'));

		(User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

		const response = await supertest(application)
			.put(`/bst/v1/user/verify-email/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				authCode: '12345'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Database error');
	});
});

describe('change user password', () => {
	it('should throw error if user not found', async () => {
		(User.findById as jest.Mock).mockResolvedValue(null);

		const response = await supertest(application)
			.put(`/bst/v1/user/change-password/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				oldPassword: 'old-password',
				newPassword: 'new-password',
				confirmNewPassword: 'new-password'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'User not found');
		expect(User.findById).toHaveBeenCalledWith(mockedId);
	});

	it('should check if old password match', async () => {
		(User.findById as jest.Mock).mockResolvedValue({
			password: 'old-db-password'
		});

		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		const response = await supertest(application)
			.put(`/bst/v1/user/change-password/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				oldPassword: 'old-password',
				newPassword: 'new-password',
				confirmNewPassword: 'new-password'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Invalid old password');

		expect(User.findById).toHaveBeenCalledWith(mockedId);
		expect(bcrypt.compare).toHaveBeenCalledWith('old-password', 'old-db-password');
	});

	it('should hash new password and save in db successfully', async () => {
		const mockUser = {
			password: 'old-db-password',
			save: jest.fn().mockResolvedValue({})
		};

		(User.findById as jest.Mock).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(bcrypt.hash as jest.Mock).mockResolvedValue('new-db-password');

		const response = await supertest(application)
			.put(`/bst/v1/user/change-password/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				oldPassword: 'old-password',
				newPassword: 'new-password',
				confirmNewPassword: 'new-password'
			});

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('success', true);
		expect(response.body).toHaveProperty('message', 'Password updated successfully');

		expect(User.findById).toHaveBeenCalledWith(mockedId);
		expect(bcrypt.compare).toHaveBeenCalledWith('old-password', 'old-db-password');
		expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
		expect(mockUser.save).toHaveBeenCalled();
		expect(mockUser.password).toBe('new-db-password');
	});

	it('should handle other errors', async () => {
		(User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

		(bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Database error'));

		(bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Database error'));

		const response = await supertest(application)
			.put(`/bst/v1/user/change-password/${mockedId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				oldPassword: 'old-password',
				newPassword: 'new-password',
				confirmNewPassword: 'new-password'
			});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Database error');
	});
});

describe('Delete user account', () => {
	it('should throw error if user not found', async () => {
		(User.findById as jest.Mock).mockResolvedValue(null);

		const response = await supertest(application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'User not found');
		expect(User.findById).toHaveBeenCalledWith(mockedId);
	});

	it('should delete user and users token', async () => {
		(User.findById as jest.Mock).mockResolvedValue({
			_id: mockedId
		});

		(User.findByIdAndDelete as jest.Mock).mockResolvedValue({});
		(Token.findOneAndDelete as jest.Mock).mockResolvedValue({});

		const response = await supertest(application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('success', true);
		expect(response.body).toHaveProperty('message', 'User deleted successfully');

		expect(User.findById).toHaveBeenCalledWith(mockedId);
		expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockedId);
		expect(Token.findOneAndDelete).toHaveBeenCalledWith({ userId: mockedId });
	});

	it('should handle other errors', async () => {
		(User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

		const response = await supertest(application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('success', false);
		expect(response.body).toHaveProperty('message', 'Database error');
	});
});
