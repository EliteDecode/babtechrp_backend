import bcrypt from 'bcrypt';
import User from '../../src/models/userModel';
import {
	forgot_password,
	get_access_token,
	login_user,
	logout_user,
	register_user,
	reset_password,
	verify_user_token
} from '../../src/services/authServices';
import jwtUtils from '../../src/utils/jwtUtils';
import Token from '../../src/models/tokenModel';
import { IUser, IUserLogin } from '../../src/interfaces/IUser';
import AuthToken from '../../src/models/authTokenModel';
import { generateReferralNumber } from '../../src/helpers/generateReferralCode';
import sendMail from '../../src/utils/emailUtils';
import { cleanupTokensAfterFailedEmailMessage } from '../../src/helpers/cleanUpExpiredUser';
import { IToken } from '../../src/interfaces/IToken';
import Wallet from '../../src/models/walletModel';
import mongoose from 'mongoose';
import supertest from 'supertest';

jest.mock('../../src/models/userModel');
jest.mock('../../src/models/tokenModel');
jest.mock('bcrypt');
jest.mock('../../src/utils/jwtUtils');
jest.mock('../../src/helpers/generateReferralCode.ts');
jest.mock('../../src/models/authTokenModel.ts');
jest.mock('../../src/utils/emailUtils.ts');
jest.mock('../../src/helpers/cleanUpExpiredUser.ts');
jest.mock('../../src/models/tokenModel.ts');
jest.mock('../../src/models/walletModel.ts');

//Login Unit Testing.
describe('login_user', () => {
	const params = {
		data: {
			email: 'test@example.com',
			password: 'password'
		} as IUserLogin,
		user: {
			id: ''
		},
		query: {},
		admin: {
			id: ''
		}
	};
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should throw an error if user is not found', async () => {
		// Type assertion to treat findOne as a Jest mock function
		(User.findOne as jest.Mock).mockResolvedValue(null);
		await expect(login_user(params)).rejects.toThrow('User not found');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
	});

	it('should throw an error if the user is suspended', async () => {
		// Mock the User.findOne method to return a suspended user
		(User.findOne as jest.Mock).mockResolvedValue({
			isSuspended: true
		});
		await expect(login_user(params)).rejects.toThrow('Your account has been suspended');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
	});

	it('should throw an error if wrong password is entered', async () => {
		// Mock the User.findOne method to return a valid user
		(User.findOne as jest.Mock).mockResolvedValue({
			password: 'hashedpassword'
		});
		// Mock bcrypt.compare to return false, simulating an invalid password
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(login_user(params)).rejects.toThrow('Invalid password');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
	});

	it('should update the token if a token is found in the database', async () => {
		// Mocking the method to find an existing token in the database
		(Token.findOne as jest.Mock).mockResolvedValue({
			refreshToken: 'refresh-token'
		});

		(User.findOne as jest.Mock).mockResolvedValue({
			_id: 'test-user-id'
		});

		const mockTokens = {
			accessToken: 'newAccessToken',
			refreshToken: 'newRefreshToken'
		};
		(jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);

		// Mocking the method to update the existing token in the database
		(Token.findOneAndUpdate as jest.Mock).mockResolvedValue({
			userId: 'test-user-id',
			refreshToken: 'new-refresh-token',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		});

		// Mocking bcrypt.compare to return true, simulating a valid password
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		const result = await login_user(params);
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(Token.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
		expect(Token.findOneAndUpdate).toHaveBeenCalledWith(
			{ userId: 'test-user-id' },
			{ refreshToken: 'newRefreshToken', expiresAt: expect.any(Date) }
		);
		expect(result).toEqual({
			success: true,
			message: 'Login successful',
			data: {
				accessToken: 'newAccessToken',
				refreshToken: 'newRefreshToken'
			}
		});
	});

	it('should create the token if a token is not found in the database', async () => {
		// Mocking the method to find an existing token in the database
		(Token.findOne as jest.Mock).mockResolvedValue(null);

		(User.findOne as jest.Mock).mockResolvedValue({
			_id: 'test-user-id'
		});

		const mockTokens = {
			accessToken: 'newAccessToken',
			refreshToken: 'newRefreshToken'
		};
		(jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);

		// Mocking bcrypt.compare to return true, simulating a valid password
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		const result = await login_user(params);
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(Token.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
		expect(Token.create).toHaveBeenCalledWith({ userId: 'test-user-id', refreshToken: 'newRefreshToken', expiresAt: expect.any(Date) });
		expect(result).toEqual({
			success: true,
			message: 'Login successful',
			data: {
				accessToken: 'newAccessToken',
				refreshToken: 'newRefreshToken'
			}
		});
	});
});

describe('register_user', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const params = {
		data: {
			email: 'test@example.com',
			password: 'password',
			fullname: 'mockname',
			phone: 'mock-090',
			confirmPassword: 'password'
		} as IUser,
		user: {
			id: ''
		},
		query: {},
		admin: {
			id: ''
		}
	};

	it('Check if Users email already exists and auth code exists', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			_id: 'test_user_id'
		});
		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			userId: 'test_user_id'
		});

		await expect(register_user(params)).rejects.toThrow('A valid verification code already exists. Please use it or wait for it to expire.');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test_user_id', expiresAt: { $gt: expect.any(Date) } });
	});

	it('check if Users email already exists with no authCode', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			_id: 'test_user_id'
		});

		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);

		await expect(register_user(params)).rejects.toThrow('User with this email already exists. Please login or use a different email.');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test_user_id', expiresAt: { $gt: expect.any(Date) } });
	});

	it('should save user details', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);
		(generateReferralNumber as jest.Mock).mockReturnValue('referralNunmber');
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

		await register_user(params);

		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		const userMockInstance = (User as unknown as jest.Mock).mock.instances[0];
		expect(userMockInstance.save).toHaveBeenCalled();

		expect(User).toHaveBeenCalledWith({
			fullname: 'mockname',
			email: 'test@example.com',
			password: 'hashedPassword',
			isEmailVerified: false,
			isSuspended: false,
			phone: null,
			address: null,
			referralCode: 'referralNunmber'
		});
	});

	it('Should create token in the database and send mail', async () => {
		const mockUserInstance = {
			_id: 'new_user_id',
			email: 'test@example.com',
			save: jest.fn().mockResolvedValue({
				_id: 'new_user_id',
				email: 'test@example.com'
			})
		};
		(User as unknown as jest.Mock).mockReturnValue(mockUserInstance);

		(bcrypt.hash as jest.Mock).mockResolvedValue('hashedVerificationCode'); // This mocks the hashing process

		(AuthToken.create as jest.Mock).mockResolvedValue({
			userId: 'new_user_id',
			authCode: 'hashedVerificationCode',
			expiresAt: expect.any(Date)
		});
		(sendMail as jest.Mock).mockResolvedValue(null);
		const result = await register_user(params);

		expect(mockUserInstance.save).toHaveBeenCalled();
		expect(AuthToken.create).toHaveBeenCalledWith({
			userId: 'new_user_id',
			authCode: 'hashedVerificationCode',
			expiresAt: expect.any(Date)
		});
		expect(sendMail).toHaveBeenCalled();
		expect(result).toEqual({
			success: true,
			message: 'User registered successfully. Please verify your email using the code sent to your email.',
			data: {
				_id: 'new_user_id',
				email: 'test@example.com'
			}
		});
	});

	it('should handle email sending errors and clean up tokens', async () => {
		const mockUserInstance = {
			_id: 'new_user_id',
			email: 'test@example.com',
			save: jest.fn().mockResolvedValue({
				_id: 'new_user_id',
				email: 'test@example.com'
			})
		};

		(User as unknown as jest.Mock).mockReturnValue(mockUserInstance);
		(bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedVerificationCode');
		(AuthToken.create as jest.Mock).mockResolvedValue({
			userId: 'new_user_id',
			authCode: 'hashedVerificationCode',
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		});
		(sendMail as jest.Mock).mockRejectedValue(new Error('Email sending failed'));
		(cleanupTokensAfterFailedEmailMessage as jest.Mock).mockResolvedValue({});

		await expect(register_user(params)).rejects.toThrow('Error sending verification email: Email sending failed');

		expect(mockUserInstance.save).toHaveBeenCalled();
		expect(AuthToken.create).toHaveBeenCalled();
		expect(sendMail).toHaveBeenCalled();
		expect(cleanupTokensAfterFailedEmailMessage).toHaveBeenCalledWith({ id: 'new_user_id' });
	});
});

describe('verify_user', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	const params = {
		data: {
			authCode: 'testCode'
		} as IToken,
		user: {
			id: ''
		},
		query: {
			userId: 'test-user-id'
		},
		admin: {
			id: ''
		}
	};

	it('Should return error if token not found', async () => {
		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);

		await expect(verify_user_token(params)).rejects.toThrow('Verification code is incorrect');
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
	});

	it('should throw error if token does not match', async () => {
		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			authCode: 'db-test-code',
			_id: 'user_id'
		});

		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(verify_user_token(params)).rejects.toThrow('Invalid or expired verification code');
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
		expect(bcrypt.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
	});

	it('should update user if token matches', async () => {
		const mockUserId = new mongoose.Types.ObjectId();
		const mockAuthTokenId = new mongoose.Types.ObjectId();

		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			authCode: 'db-test-code',
			_id: mockAuthTokenId,
			userId: mockUserId
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
			_id: mockUserId,
			isEmailVerified: true
		});

		const result = await verify_user_token(params);
		expect(AuthToken.findOne).toHaveBeenCalledWith({
			userId: params.query.userId,
			expiresAt: { $gt: expect.any(Date) }
		});
		expect(bcrypt.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, { isEmailVerified: true }, { new: true });
		expect(Wallet.prototype.save).toHaveBeenCalled();
		expect(Wallet).toHaveBeenCalledWith({
			userId: mockUserId,
			total: 0,
			withdrawn: 0,
			balance: 0,
			transactions: []
		});
		expect(AuthToken.findByIdAndDelete).toHaveBeenCalledWith(mockAuthTokenId);
		expect(result).toEqual({
			success: true,
			message: 'Email successfully verified',
			data: {
				_id: mockUserId,
				isEmailVerified: true
			}
		});
	});

	it('throw error if an error occurs during the process', async () => {
		// Mocking successful token fetch and matching
		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			authCode: 'db-test-code',
			_id: 'user_id',
			userId: 'test-user-id'
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		// Mocking database failure during user update
		(User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

		await expect(verify_user_token(params)).rejects.toThrow('Error verifying user token: Database error');
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
		expect(bcrypt.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith('test-user-id', { isEmailVerified: true }, { new: true });
	});
});

describe('logout_user', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const params = {
		data: {
			refreshToken: 'refresh_Token'
		} as { refreshToken: string },
		user: {
			id: ''
		},
		query: {
			userId: ''
		},
		admin: {
			id: ''
		}
	};

	it('Throw error if token not found', async () => {
		(Token.findOneAndDelete as jest.Mock).mockResolvedValue(null);

		await expect(logout_user(params)).rejects.toThrow('Refresh token not found');
		expect(Token.findOneAndDelete).toHaveBeenCalledWith({ refreshToken: 'refresh_Token' });
	});

	it('Logout User if Token Found', async () => {
		(Token.findOneAndDelete as jest.Mock).mockResolvedValue({
			refreshToken: 'refresh_Token',
			userId: 'test-user-id'
		});

		const result = await logout_user(params);
		expect(Token.findOneAndDelete).toHaveBeenCalledWith({ refreshToken: 'refresh_Token' });
		expect(result).toEqual({
			success: true,
			message: 'Logout successful',
			data: null
		});
	});

	it('Throw error if databse error', async () => {
		(Token.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));

		await expect(logout_user(params)).rejects.toThrow('Error logging out user: Database error');
	});
});

describe('forgot_password', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const params = {
		data: {
			email: 'test@example.com'
		} as IUser,
		user: {
			id: ''
		},
		query: {},
		admin: {
			id: ''
		}
	};

	it('Throw Error if User with Email not Found', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);
		await expect(forgot_password(params)).rejects.toThrow('User with this email does not exist');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
	});

	it('Throw Error if user found and token exists', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			_id: 'test-user-id'
		});

		(AuthToken.findOne as jest.Mock).mockResolvedValue({
			userId: 'test-user-id',
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		});

		await expect(forgot_password(params)).rejects.toThrow('A valid verification code already exists. Please use it or wait for it to expire.');
		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
	});

	it('should send a password reset email and create a token if user exists and no valid token is found', async () => {
		const mockUser = {
			_id: 'user-id',
			email: 'test@example.com'
		};

		(User.findOne as jest.Mock).mockResolvedValue(mockUser);
		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);
		(jwtUtils.generateResetToken as jest.Mock).mockReturnValue('reset-token');
		(sendMail as jest.Mock).mockResolvedValue(null);

		const result = await forgot_password(params);

		expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		expect(AuthToken.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
		expect(jwtUtils.generateResetToken).toHaveBeenCalledWith(mockUser);
		expect(sendMail).toHaveBeenCalledWith({
			email: 'test@example.com',
			subject: 'Password Reset Request',
			text: expect.stringContaining('Reset Password')
		});
		expect(AuthToken.create).toHaveBeenCalledWith({
			userId: 'user-id',
			authCode: 'reset-token',
			expiresAt: expect.any(Date)
		});
		expect(result).toEqual({
			success: true,
			message: 'Password reset email sent successfully',
			data: 'reset-token'
		});
	});

	it('should handle errors during the process and clean up tokens', async () => {
		const mockUser = {
			_id: 'user-id',
			email: 'test@example.com'
		};

		(User.findOne as jest.Mock).mockResolvedValue(mockUser);
		(AuthToken.findOne as jest.Mock).mockResolvedValue(null);
		(jwtUtils.generateResetToken as jest.Mock).mockReturnValue('reset-token');
		(sendMail as jest.Mock).mockRejectedValue(new Error('Email service error'));
		(AuthToken.create as jest.Mock).mockResolvedValue({});

		await expect(forgot_password(params)).rejects.toThrow('Error sending password reset email: Error: Email service error');

		expect(sendMail).toHaveBeenCalledWith({
			email: 'test@example.com',
			subject: 'Password Reset Request',
			text: expect.stringContaining('Reset Password')
		});
		expect(cleanupTokensAfterFailedEmailMessage).toHaveBeenCalledWith({ id: 'user-id' });
	});
});

describe('reset_password', () => {
	afterAll(() => {
		jest.clearAllMocks();
	});

	const params = {
		data: {
			password: 'newPassword123',
			token: 'reset-token'
		} as { password: string; token: string },
		user: {
			id: ''
		},
		query: {},
		admin: {
			id: ''
		}
	};

	it('Throw UnAuthorized Error When Token is Invalid', async () => {
		(jwtUtils.verifyToken as jest.Mock).mockReturnValue({
			id: 'user-id'
		});

		(User.findById as jest.Mock).mockResolvedValue(null);

		await expect(reset_password(params)).rejects.toThrow('Invalid or expired reset token');
		expect(jwtUtils.verifyToken).toHaveBeenCalledWith('reset-token');
		expect(User.findById).toHaveBeenCalledWith('user-id');
	});

	it('should hash the password and change the user password', async () => {
		(jwtUtils.verifyToken as jest.Mock).mockReturnValue({
			id: 'user-id'
		});

		(User.findById as jest.Mock).mockResolvedValue({
			_id: 'db-user-id'
		});

		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
		(User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
		const result = await reset_password(params);
		expect(jwtUtils.verifyToken).toHaveBeenCalledWith('reset-token');
		expect(User.findById).toHaveBeenCalledWith('user-id');
		expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { password: 'hashed-password' });
		expect(result).toEqual({
			success: true,
			message: 'Password reset successful',
			data: null
		});
	});

	it('Handle all errors resulting', async () => {
		(jwtUtils.verifyToken as jest.Mock).mockReturnValue({
			id: 'user-id'
		});

		(User.findById as jest.Mock).mockResolvedValue({
			_id: 'db-user-id'
		});
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
		(User.findByIdAndUpdate as jest.Mock).mockRejectedValue('Database Error');
		await expect(reset_password(params)).rejects.toThrow('Error resetting password: Database Error');
	});
});

describe('get_access_token', () => {
	afterAll(() => {
		jest.clearAllMocks();
	});

	const params = {
		data: {
			refreshToken: 'refresh-token'
		} as IToken,
		user: {
			id: ''
		},
		query: {},
		admin: {
			id: ''
		}
	};

	it('Throw Error if refresh token not found', async () => {
		(Token.findOne as jest.Mock).mockResolvedValue(null);

		await expect(get_access_token(params)).rejects.toThrow('Invalid refresh token');
		expect(Token.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
	});

	it('Throw Error if refresh token is not valid', async () => {
		(Token.findOne as jest.Mock).mockResolvedValue({
			refreshToken: 'db-refresh-token'
		});

		(jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue(null);

		await expect(get_access_token(params)).rejects.toThrow('Invalid refresh token');
		expect(Token.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
		expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
	});

	it('should generate access token for user', async () => {
		(Token.findOne as jest.Mock).mockResolvedValue({
			refreshToken: 'db-refresh-token'
		});

		(jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
			id: 'user-id'
		});
		(User.findById as jest.Mock).mockResolvedValue({
			_id: 'db-user-id'
		});
		(jwtUtils.generateTokens as jest.Mock).mockReturnValue({
			accessToken: 'access-token',
			refreshToken: 'new-refresh-token'
		});

		await expect(get_access_token(params)).resolves.toEqual({
			success: true,
			message: 'Access token generated successfully',
			data: {
				accessToken: 'access-token',
				refreshToken: 'new-refresh-token'
			}
		});

		expect(Token.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
		expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
		expect(User.findById).toHaveBeenCalledWith('user-id');
		expect(Token.findOneAndUpdate).toHaveBeenCalledWith(
			{ userId: 'db-user-id' },
			{ refreshToken: 'new-refresh-token', expiresAt: expect.any(Date) }
		);
		expect(jwtUtils.generateTokens).toHaveBeenCalledWith({ _id: 'db-user-id' });
	});

	it('Handle all errors', async () => {
		(Token.findOne as jest.Mock).mockResolvedValue({
			refreshToken: 'db-refresh-token'
		});

		(jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
			id: 'user-id'
		});
		(User.findById as jest.Mock).mockResolvedValue({
			_id: 'db-user-id'
		});
		(jwtUtils.generateTokens as jest.Mock).mockReturnValue({
			accessToken: 'access-token',
			refreshToken: 'new-refresh-token'
		});
		(Token.findOneAndUpdate as jest.Mock).mockRejectedValue('Database Error');

		await expect(get_access_token(params)).rejects.toThrow('Error generating access token: Database Error');
		expect(Token.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
		expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
		expect(User.findById).toHaveBeenCalledWith('user-id');
		expect(Token.findOneAndUpdate).toHaveBeenCalledWith(
			{ userId: 'db-user-id' },
			{ refreshToken: 'new-refresh-token', expiresAt: expect.any(Date) }
		);
		expect(jwtUtils.generateTokens).toHaveBeenCalledWith({ _id: 'db-user-id' });
	});
});
