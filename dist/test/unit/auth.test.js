"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../src/models/userModel"));
const authServices_1 = require("../../src/services/authServices");
const jwtUtils_1 = __importDefault(require("../../src/utils/jwtUtils"));
const tokenModel_1 = __importDefault(require("../../src/models/tokenModel"));
const authTokenModel_1 = __importDefault(require("../../src/models/authTokenModel"));
const generateReferralCode_1 = require("../../src/helpers/generateReferralCode");
const emailUtils_1 = __importDefault(require("../../src/utils/emailUtils"));
const cleanUpExpiredUser_1 = require("../../src/helpers/cleanUpExpiredUser");
const walletModel_1 = __importDefault(require("../../src/models/walletModel"));
const mongoose_1 = __importDefault(require("mongoose"));
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
        },
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
    it('should throw an error if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
        // Type assertion to treat findOne as a Jest mock function
        userModel_1.default.findOne.mockResolvedValue(null);
        yield expect((0, authServices_1.login_user)(params)).rejects.toThrow('User not found');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    }));
    it('should throw an error if the user is suspended', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the User.findOne method to return a suspended user
        userModel_1.default.findOne.mockResolvedValue({
            isSuspended: true
        });
        yield expect((0, authServices_1.login_user)(params)).rejects.toThrow('Your account has been suspended');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    }));
    it('should throw an error if wrong password is entered', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the User.findOne method to return a valid user
        userModel_1.default.findOne.mockResolvedValue({
            password: 'hashedpassword'
        });
        // Mock bcrypt.compare to return false, simulating an invalid password
        bcrypt_1.default.compare.mockResolvedValue(false);
        yield expect((0, authServices_1.login_user)(params)).rejects.toThrow('Invalid password');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('password', 'hashedpassword');
    }));
    it('should update the token if a token is found in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking the method to find an existing token in the database
        tokenModel_1.default.findOne.mockResolvedValue({
            refreshToken: 'refresh-token'
        });
        userModel_1.default.findOne.mockResolvedValue({
            _id: 'test-user-id'
        });
        const mockTokens = {
            accessToken: 'newAccessToken',
            refreshToken: 'newRefreshToken'
        };
        jwtUtils_1.default.generateTokens.mockReturnValue(mockTokens);
        // Mocking the method to update the existing token in the database
        tokenModel_1.default.findOneAndUpdate.mockResolvedValue({
            userId: 'test-user-id',
            refreshToken: 'new-refresh-token',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        // Mocking bcrypt.compare to return true, simulating a valid password
        bcrypt_1.default.compare.mockResolvedValue(true);
        const result = yield (0, authServices_1.login_user)(params);
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
        expect(tokenModel_1.default.findOneAndUpdate).toHaveBeenCalledWith({ userId: 'test-user-id' }, { refreshToken: 'newRefreshToken', expiresAt: expect.any(Date) });
        expect(result).toEqual({
            success: true,
            message: 'Login successful',
            data: {
                accessToken: 'newAccessToken',
                refreshToken: 'newRefreshToken'
            }
        });
    }));
    it('should create the token if a token is not found in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking the method to find an existing token in the database
        tokenModel_1.default.findOne.mockResolvedValue(null);
        userModel_1.default.findOne.mockResolvedValue({
            _id: 'test-user-id'
        });
        const mockTokens = {
            accessToken: 'newAccessToken',
            refreshToken: 'newRefreshToken'
        };
        jwtUtils_1.default.generateTokens.mockReturnValue(mockTokens);
        // Mocking bcrypt.compare to return true, simulating a valid password
        bcrypt_1.default.compare.mockResolvedValue(true);
        const result = yield (0, authServices_1.login_user)(params);
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
        expect(tokenModel_1.default.create).toHaveBeenCalledWith({ userId: 'test-user-id', refreshToken: 'newRefreshToken', expiresAt: expect.any(Date) });
        expect(result).toEqual({
            success: true,
            message: 'Login successful',
            data: {
                accessToken: 'newAccessToken',
                refreshToken: 'newRefreshToken'
            }
        });
    }));
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
        },
        user: {
            id: ''
        },
        query: {},
        admin: {
            id: ''
        }
    };
    it('Check if Users email already exists and auth code exists', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue({
            _id: 'test_user_id'
        });
        authTokenModel_1.default.findOne.mockResolvedValue({
            userId: 'test_user_id'
        });
        yield expect((0, authServices_1.register_user)(params)).rejects.toThrow('A valid verification code already exists. Please use it or wait for it to expire.');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test_user_id', expiresAt: { $gt: expect.any(Date) } });
    }));
    it('check if Users email already exists with no authCode', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue({
            _id: 'test_user_id'
        });
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        yield expect((0, authServices_1.register_user)(params)).rejects.toThrow('User with this email already exists. Please login or use a different email.');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test_user_id', expiresAt: { $gt: expect.any(Date) } });
    }));
    it('should save user details', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue(null);
        generateReferralCode_1.generateReferralNumber.mockReturnValue('referralNunmber');
        bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
        yield (0, authServices_1.register_user)(params);
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        const userMockInstance = userModel_1.default.mock.instances[0];
        expect(userMockInstance.save).toHaveBeenCalled();
        expect(userModel_1.default).toHaveBeenCalledWith({
            fullname: 'mockname',
            email: 'test@example.com',
            password: 'hashedPassword',
            isEmailVerified: false,
            isSuspended: false,
            phone: null,
            address: null,
            referralCode: 'referralNunmber'
        });
    }));
    it('Should create token in the database and send mail', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserInstance = {
            _id: 'new_user_id',
            email: 'test@example.com',
            save: jest.fn().mockResolvedValue({
                _id: 'new_user_id',
                email: 'test@example.com'
            })
        };
        userModel_1.default.mockReturnValue(mockUserInstance);
        bcrypt_1.default.hash.mockResolvedValue('hashedVerificationCode'); // This mocks the hashing process
        authTokenModel_1.default.create.mockResolvedValue({
            userId: 'new_user_id',
            authCode: 'hashedVerificationCode',
            expiresAt: expect.any(Date)
        });
        emailUtils_1.default.mockResolvedValue(null);
        const result = yield (0, authServices_1.register_user)(params);
        expect(mockUserInstance.save).toHaveBeenCalled();
        expect(authTokenModel_1.default.create).toHaveBeenCalledWith({
            userId: 'new_user_id',
            authCode: 'hashedVerificationCode',
            expiresAt: expect.any(Date)
        });
        expect(emailUtils_1.default).toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            message: 'User registered successfully. Please verify your email using the code sent to your email.',
            data: {
                _id: 'new_user_id',
                email: 'test@example.com'
            }
        });
    }));
    it('should handle email sending errors and clean up tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserInstance = {
            _id: 'new_user_id',
            email: 'test@example.com',
            save: jest.fn().mockResolvedValue({
                _id: 'new_user_id',
                email: 'test@example.com'
            })
        };
        userModel_1.default.mockReturnValue(mockUserInstance);
        bcrypt_1.default.hash.mockResolvedValueOnce('hashedVerificationCode');
        authTokenModel_1.default.create.mockResolvedValue({
            userId: 'new_user_id',
            authCode: 'hashedVerificationCode',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        emailUtils_1.default.mockRejectedValue(new Error('Email sending failed'));
        cleanUpExpiredUser_1.cleanupTokensAfterFailedEmailMessage.mockResolvedValue({});
        yield expect((0, authServices_1.register_user)(params)).rejects.toThrow('Error sending verification email: Email sending failed');
        expect(mockUserInstance.save).toHaveBeenCalled();
        expect(authTokenModel_1.default.create).toHaveBeenCalled();
        expect(emailUtils_1.default).toHaveBeenCalled();
        expect(cleanUpExpiredUser_1.cleanupTokensAfterFailedEmailMessage).toHaveBeenCalledWith({ id: 'new_user_id' });
    }));
});
describe('verify_user', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const params = {
        data: {
            authCode: 'testCode'
        },
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
    it('Should return error if token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        yield expect((0, authServices_1.verify_user_token)(params)).rejects.toThrow('Verification code is incorrect');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
    }));
    it('should throw error if token does not match', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockResolvedValue({
            authCode: 'db-test-code',
            _id: 'user_id'
        });
        bcrypt_1.default.compare.mockResolvedValue(false);
        yield expect((0, authServices_1.verify_user_token)(params)).rejects.toThrow('Invalid or expired verification code');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
    }));
    it('should update user if token matches', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUserId = new mongoose_1.default.Types.ObjectId();
        const mockAuthTokenId = new mongoose_1.default.Types.ObjectId();
        authTokenModel_1.default.findOne.mockResolvedValue({
            authCode: 'db-test-code',
            _id: mockAuthTokenId,
            userId: mockUserId
        });
        bcrypt_1.default.compare.mockResolvedValue(true);
        userModel_1.default.findByIdAndUpdate.mockResolvedValue({
            _id: mockUserId,
            isEmailVerified: true
        });
        const result = yield (0, authServices_1.verify_user_token)(params);
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({
            userId: params.query.userId,
            expiresAt: { $gt: expect.any(Date) }
        });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
        expect(userModel_1.default.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, { isEmailVerified: true }, { new: true });
        expect(walletModel_1.default.prototype.save).toHaveBeenCalled();
        expect(walletModel_1.default).toHaveBeenCalledWith({
            userId: mockUserId,
            total: 0,
            withdrawn: 0,
            balance: 0,
            transactions: []
        });
        expect(authTokenModel_1.default.findByIdAndDelete).toHaveBeenCalledWith(mockAuthTokenId);
        expect(result).toEqual({
            success: true,
            message: 'Email successfully verified',
            data: {
                _id: mockUserId,
                isEmailVerified: true
            }
        });
    }));
    it('throw error if an error occurs during the process', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking successful token fetch and matching
        authTokenModel_1.default.findOne.mockResolvedValue({
            authCode: 'db-test-code',
            _id: 'user_id',
            userId: 'test-user-id'
        });
        bcrypt_1.default.compare.mockResolvedValue(true);
        // Mocking database failure during user update
        userModel_1.default.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
        yield expect((0, authServices_1.verify_user_token)(params)).rejects.toThrow('Error verifying user token: Database error');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id', expiresAt: { $gt: expect.any(Date) } });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('testCode', 'db-test-code');
        expect(userModel_1.default.findByIdAndUpdate).toHaveBeenCalledWith('test-user-id', { isEmailVerified: true }, { new: true });
    }));
});
describe('logout_user', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const params = {
        data: {
            refreshToken: 'refresh_Token'
        },
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
    it('Throw error if token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOneAndDelete.mockResolvedValue(null);
        yield expect((0, authServices_1.logout_user)(params)).rejects.toThrow('Refresh token not found');
        expect(tokenModel_1.default.findOneAndDelete).toHaveBeenCalledWith({ refreshToken: 'refresh_Token' });
    }));
    it('Logout User if Token Found', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOneAndDelete.mockResolvedValue({
            refreshToken: 'refresh_Token',
            userId: 'test-user-id'
        });
        const result = yield (0, authServices_1.logout_user)(params);
        expect(tokenModel_1.default.findOneAndDelete).toHaveBeenCalledWith({ refreshToken: 'refresh_Token' });
        expect(result).toEqual({
            success: true,
            message: 'Logout successful',
            data: null
        });
    }));
    it('Throw error if databse error', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOneAndDelete.mockRejectedValue(new Error('Database error'));
        yield expect((0, authServices_1.logout_user)(params)).rejects.toThrow('Error logging out user: Database error');
    }));
});
describe('forgot_password', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const params = {
        data: {
            email: 'test@example.com'
        },
        user: {
            id: ''
        },
        query: {},
        admin: {
            id: ''
        }
    };
    it('Throw Error if User with Email not Found', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue(null);
        yield expect((0, authServices_1.forgot_password)(params)).rejects.toThrow('User with this email does not exist');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    }));
    it('Throw Error if user found and token exists', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue({
            _id: 'test-user-id'
        });
        authTokenModel_1.default.findOne.mockResolvedValue({
            userId: 'test-user-id',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        yield expect((0, authServices_1.forgot_password)(params)).rejects.toThrow('A valid verification code already exists. Please use it or wait for it to expire.');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
    }));
    it('should send a password reset email and create a token if user exists and no valid token is found', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            _id: 'user-id',
            email: 'test@example.com'
        };
        userModel_1.default.findOne.mockResolvedValue(mockUser);
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        jwtUtils_1.default.generateResetToken.mockReturnValue('reset-token');
        emailUtils_1.default.mockResolvedValue(null);
        const result = yield (0, authServices_1.forgot_password)(params);
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
        expect(jwtUtils_1.default.generateResetToken).toHaveBeenCalledWith(mockUser);
        expect(emailUtils_1.default).toHaveBeenCalledWith({
            email: 'test@example.com',
            subject: 'Password Reset Request',
            text: expect.stringContaining('Reset Password')
        });
        expect(authTokenModel_1.default.create).toHaveBeenCalledWith({
            userId: 'user-id',
            authCode: 'reset-token',
            expiresAt: expect.any(Date)
        });
        expect(result).toEqual({
            success: true,
            message: 'Password reset email sent successfully',
            data: 'reset-token'
        });
    }));
    it('should handle errors during the process and clean up tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            _id: 'user-id',
            email: 'test@example.com'
        };
        userModel_1.default.findOne.mockResolvedValue(mockUser);
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        jwtUtils_1.default.generateResetToken.mockReturnValue('reset-token');
        emailUtils_1.default.mockRejectedValue(new Error('Email service error'));
        authTokenModel_1.default.create.mockResolvedValue({});
        yield expect((0, authServices_1.forgot_password)(params)).rejects.toThrow('Error sending password reset email: Error: Email service error');
        expect(emailUtils_1.default).toHaveBeenCalledWith({
            email: 'test@example.com',
            subject: 'Password Reset Request',
            text: expect.stringContaining('Reset Password')
        });
        expect(cleanUpExpiredUser_1.cleanupTokensAfterFailedEmailMessage).toHaveBeenCalledWith({ id: 'user-id' });
    }));
});
describe('reset_password', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });
    const params = {
        data: {
            password: 'newPassword123',
            token: 'reset-token'
        },
        user: {
            id: ''
        },
        query: {},
        admin: {
            id: ''
        }
    };
    it('Throw UnAuthorized Error When Token is Invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        jwtUtils_1.default.verifyToken.mockReturnValue({
            id: 'user-id'
        });
        userModel_1.default.findById.mockResolvedValue(null);
        yield expect((0, authServices_1.reset_password)(params)).rejects.toThrow('Invalid or expired reset token');
        expect(jwtUtils_1.default.verifyToken).toHaveBeenCalledWith('reset-token');
        expect(userModel_1.default.findById).toHaveBeenCalledWith('user-id');
    }));
    it('should hash the password and change the user password', () => __awaiter(void 0, void 0, void 0, function* () {
        jwtUtils_1.default.verifyToken.mockReturnValue({
            id: 'user-id'
        });
        userModel_1.default.findById.mockResolvedValue({
            _id: 'db-user-id'
        });
        bcrypt_1.default.hash.mockResolvedValue('hashed-password');
        userModel_1.default.findByIdAndUpdate.mockResolvedValue({});
        const result = yield (0, authServices_1.reset_password)(params);
        expect(jwtUtils_1.default.verifyToken).toHaveBeenCalledWith('reset-token');
        expect(userModel_1.default.findById).toHaveBeenCalledWith('user-id');
        expect(bcrypt_1.default.hash).toHaveBeenCalledWith('newPassword123', 10);
        expect(userModel_1.default.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { password: 'hashed-password' });
        expect(result).toEqual({
            success: true,
            message: 'Password reset successful',
            data: null
        });
    }));
    it('Handle all errors resulting', () => __awaiter(void 0, void 0, void 0, function* () {
        jwtUtils_1.default.verifyToken.mockReturnValue({
            id: 'user-id'
        });
        userModel_1.default.findById.mockResolvedValue({
            _id: 'db-user-id'
        });
        bcrypt_1.default.hash.mockResolvedValue('hashed-password');
        userModel_1.default.findByIdAndUpdate.mockRejectedValue('Database Error');
        yield expect((0, authServices_1.reset_password)(params)).rejects.toThrow('Error resetting password: Database Error');
    }));
});
describe('get_access_token', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });
    const params = {
        data: {
            refreshToken: 'refresh-token'
        },
        user: {
            id: ''
        },
        query: {},
        admin: {
            id: ''
        }
    };
    it('Throw Error if refresh token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOne.mockResolvedValue(null);
        yield expect((0, authServices_1.get_access_token)(params)).rejects.toThrow('Invalid refresh token');
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
    }));
    it('Throw Error if refresh token is not valid', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOne.mockResolvedValue({
            refreshToken: 'db-refresh-token'
        });
        jwtUtils_1.default.verifyRefreshToken.mockReturnValue(null);
        yield expect((0, authServices_1.get_access_token)(params)).rejects.toThrow('Invalid refresh token');
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
        expect(jwtUtils_1.default.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
    }));
    it('should generate access token for user', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOne.mockResolvedValue({
            refreshToken: 'db-refresh-token'
        });
        jwtUtils_1.default.verifyRefreshToken.mockReturnValue({
            id: 'user-id'
        });
        userModel_1.default.findById.mockResolvedValue({
            _id: 'db-user-id'
        });
        jwtUtils_1.default.generateTokens.mockReturnValue({
            accessToken: 'access-token',
            refreshToken: 'new-refresh-token'
        });
        yield expect((0, authServices_1.get_access_token)(params)).resolves.toEqual({
            success: true,
            message: 'Access token generated successfully',
            data: {
                accessToken: 'access-token',
                refreshToken: 'new-refresh-token'
            }
        });
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
        expect(jwtUtils_1.default.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
        expect(userModel_1.default.findById).toHaveBeenCalledWith('user-id');
        expect(tokenModel_1.default.findOneAndUpdate).toHaveBeenCalledWith({ userId: 'db-user-id' }, { refreshToken: 'new-refresh-token', expiresAt: expect.any(Date) });
        expect(jwtUtils_1.default.generateTokens).toHaveBeenCalledWith({ _id: 'db-user-id' });
    }));
    it('Handle all errors', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenModel_1.default.findOne.mockResolvedValue({
            refreshToken: 'db-refresh-token'
        });
        jwtUtils_1.default.verifyRefreshToken.mockReturnValue({
            id: 'user-id'
        });
        userModel_1.default.findById.mockResolvedValue({
            _id: 'db-user-id'
        });
        jwtUtils_1.default.generateTokens.mockReturnValue({
            accessToken: 'access-token',
            refreshToken: 'new-refresh-token'
        });
        tokenModel_1.default.findOneAndUpdate.mockRejectedValue('Database Error');
        yield expect((0, authServices_1.get_access_token)(params)).rejects.toThrow('Error generating access token: Database Error');
        expect(tokenModel_1.default.findOne).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
        expect(jwtUtils_1.default.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
        expect(userModel_1.default.findById).toHaveBeenCalledWith('user-id');
        expect(tokenModel_1.default.findOneAndUpdate).toHaveBeenCalledWith({ userId: 'db-user-id' }, { refreshToken: 'new-refresh-token', expiresAt: expect.any(Date) });
        expect(jwtUtils_1.default.generateTokens).toHaveBeenCalledWith({ _id: 'db-user-id' });
    }));
});
