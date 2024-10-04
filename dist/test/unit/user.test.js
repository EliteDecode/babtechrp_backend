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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../../src/app"); // Assuming this initializes your app
const userModel_1 = __importDefault(require("../../src/models/userModel"));
const jwtUtils_1 = __importDefault(require("../../src/utils/jwtUtils"));
const authTokenModel_1 = __importDefault(require("../../src/models/authTokenModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailUtils_1 = __importDefault(require("../../src/utils/emailUtils"));
const tokenModel_1 = __importDefault(require("../../src/models/tokenModel"));
const bstUserIdsModel_1 = __importDefault(require("../../src/models/bstUserIdsModel"));
const mockedId = new mongoose_1.default.Types.ObjectId();
// Mock the necessary modules
jest.mock('../../src/models/userModel.ts');
jest.mock('../../src/utils/emailUtils.ts');
jest.mock('../../src/models/authTokenModel.ts');
jest.mock('../../src/models/tokenModel.ts');
jest.mock('../../src/models/bstUserIdsModel.ts');
jest.mock('bcrypt');
jest.mock('node-cron', () => ({
    schedule: jest.fn()
}));
jest.mock('../../src/middleware/authHandler.ts', () => (req, res, next) => {
    req.user = { id: mockedId }; // Mock user ID
    next(); // Proceed with the request
});
const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
const mockUser = {
    _id: mockedId,
    fullname: 'Sam Johnstone',
    email: 'sirelite11@gmail.com',
    phone: '07030548630',
    address: '125 Ekenwan road',
    username: 'jipovm',
    isEmailVerified: true,
    isProfileUpdated: true,
    isSuspended: false,
    referralCode: 12345,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
};
describe('Test for fetching user details', () => {
    it('should return user when found', () => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a valid accessToken using your generateTokens function
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId }); // Adjust as needed
        // Mock the User.findById method to simulate chainable .select()
        const mockSelect = jest.fn().mockResolvedValue(mockUser);
        userModel_1.default.findById.mockReturnValue({ select: mockSelect });
        // Send request to the protected route with a valid token
        const response = yield (0, supertest_1.default)(app_1.application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);
        // Check that the status code and response body are as expected
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        // Ensure the User.findById method was called with the correct ID
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
        expect(mockSelect).toHaveBeenCalledWith('-password'); // Ensure .select('-password') was called
    }));
    it('should throw error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(null);
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
    }));
    it('should handle all other errors', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock User.findById to return an object with the select method that throws an error
        const mockSelect = jest.fn().mockRejectedValue(new Error('Database error'));
        userModel_1.default.findById.mockReturnValue({ select: mockSelect });
        // Generate access token with mocked user ID
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        // Perform the request
        const response = yield (0, supertest_1.default)(app_1.application).get('/bst/v1/user/').set('Authorization', `Bearer ${accessToken}`);
        // Assert that a 400 status is returned for the error
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Database error');
        // Ensure User.findById and select were called
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
        expect(mockSelect).toHaveBeenCalledWith('-password');
    }));
});
describe('Test for updating user details', () => {
    it('should check for user, and throw error for not found', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(null);
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application).put(`/bst/v1/user/${mockedId}`).set('Authorization', `Bearer ${accessToken}`).send({
            fullname: 'Sam Johnstone'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'User not found');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should throw error if email exists in the body to be updated', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: 'newemail@example.com' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Email cannot be updated');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should throw error if username already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        userModel_1.default.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { username: 'existinguser' }));
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'existinguser' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Username already exists');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should throw error if phone number already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        userModel_1.default.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { phone: '1234567890' }));
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ phone: '1234567890' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Phone number already exists');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should throw error if bst id doesnt exists in the body to be updated', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        userModel_1.default.findOne.mockResolvedValue(null);
        bstUserIdsModel_1.default.findOne.mockResolvedValue(null);
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ bstId: 'jipov1234' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'User ID not found');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should throw error if bst id exists but is invalid in the body to be updated', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        userModel_1.default.findOne.mockResolvedValue(null);
        bstUserIdsModel_1.default.findOne.mockResolvedValueOnce({ bstId: 'jipov1234' });
        bstUserIdsModel_1.default.findOne.mockResolvedValueOnce(null);
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ bstId: 'jipov1234', phone: '1234567' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid User ID Entered');
        expect(userModel_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    }));
    it('should update user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(mockUser);
        userModel_1.default.findOne.mockResolvedValue(null);
        bstUserIdsModel_1.default.findOne.mockResolvedValueOnce({ bstId: 'validBstId', save: jest.fn() });
        bstUserIdsModel_1.default.findOne.mockResolvedValueOnce({ phone: '1234567', bstId: 'validBstId' });
        const mockSelect = jest.fn().mockResolvedValue(Object.assign(Object.assign({}, mockUser), { fullname: 'Sam Johnstone', isProfileUpdated: true }));
        userModel_1.default.findByIdAndUpdate.mockReturnValue({
            select: mockSelect
        });
        const { accessToken } = jwtUtils_1.default.generateTokens({ _id: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ fullname: 'Sam Johnstone', bstId: 'validBstId', phone: '1234567' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'User details updated successfully');
        expect(userModel_1.default.findByIdAndUpdate).toHaveBeenCalledWith(mockedId, { fullname: 'Sam Johnstone', bstId: 'validBstId', phone: '1234567', isProfileUpdated: true }, { new: true });
        expect(mockSelect).toHaveBeenCalledWith('-password');
    }));
});
describe('Change Email', () => {
    it('should return an error if the new email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue(mockUser);
        const response = yield (0, supertest_1.default)(app_1.application)
            .post(`/bst/v1/user/update-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            email: 'jamei@gmail.com'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Email already exists');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'jamei@gmail.com' });
    }));
    it('should return an error if token matches with any in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue(null);
        authTokenModel_1.default.findOne.mockResolvedValue({ user: mockedId });
        const response = yield (0, supertest_1.default)(app_1.application)
            .post(`/bst/v1/user/update-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            email: 'newemail@example.com'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Verification code already sent to your email');
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'newemail@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: mockedId });
    }));
    it('should create token and send mail', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockResolvedValue(null);
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        authTokenModel_1.default.create.mockResolvedValue({
            userId: mockedId
        });
        bcrypt_1.default.hash.mockResolvedValue('hashedVerificationCode');
        emailUtils_1.default.mockResolvedValue(true);
        const response = yield (0, supertest_1.default)(app_1.application)
            .post(`/bst/v1/user/update-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            email: 'newemail@example.com'
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            success: true,
            message: 'Verification code sent to your email'
        }));
        expect(userModel_1.default.findOne).toHaveBeenCalledWith({ email: 'newemail@example.com' });
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({ userId: mockedId });
        expect(authTokenModel_1.default.create).toHaveBeenCalledWith({
            userId: mockedId,
            authCode: 'hashedVerificationCode',
            expiresAt: expect.any(Date),
            newEmail: 'newemail@example.com'
        });
        expect(bcrypt_1.default.hash).toHaveBeenCalled();
        expect(emailUtils_1.default).toHaveBeenCalled();
    }));
    it('should handle other errors', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findOne.mockRejectedValue(new Error('Database error'));
        authTokenModel_1.default.findOne.mockRejectedValue(new Error('Database error'));
        authTokenModel_1.default.create.mockRejectedValue(new Error('Database error'));
        bcrypt_1.default.hash.mockRejectedValue(new Error('Database error'));
        emailUtils_1.default.mockRejectedValue(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app_1.application)
            .post(`/bst/v1/user/update-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            email: 'newemail@example.com'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Database error');
    }));
});
describe('Verify email', () => {
    it('throw an error if authToken not found', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockResolvedValue(null);
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/verify-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            authCode: '123456'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'The verification code you entered is incorrect or has expired. Please try again');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({
            userId: mockedId
        });
    }));
    it('should throw an error if verification code doesnt match', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockResolvedValue({
            authCode: '12345'
        });
        bcrypt_1.default.compare.mockResolvedValue(false);
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/verify-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            authCode: '123456'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid or expired verification code');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({
            userId: mockedId
        });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('123456', '12345');
    }));
    it('should update user email successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockResolvedValue({
            authCode: 'db-auth-code', // Mock hashed authCode
            newEmail: 'newemail@example.com',
            userId: 'user-id',
            _id: 'token-id'
        });
        bcrypt_1.default.compare.mockResolvedValue(true);
        userModel_1.default.findByIdAndUpdate.mockResolvedValue({
            _id: mockedId,
            fullname: 'Sam Johnstone',
            email: 'newemail@example.com' // Updated email
        });
        authTokenModel_1.default.findByIdAndDelete.mockResolvedValue({});
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/verify-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            authCode: 12345
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Email successfully verified');
        expect(authTokenModel_1.default.findOne).toHaveBeenCalledWith({
            userId: mockedId
        });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('12345', 'db-auth-code');
        expect(userModel_1.default.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { email: 'newemail@example.com' }, { new: true });
        expect(authTokenModel_1.default.findByIdAndDelete).toHaveBeenCalledWith('token-id');
    }));
    it('should handle other errors', () => __awaiter(void 0, void 0, void 0, function* () {
        authTokenModel_1.default.findOne.mockRejectedValue(new Error('Database error'));
        bcrypt_1.default.compare.mockRejectedValue(new Error('Database error'));
        userModel_1.default.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app_1.application)
            .put(`/bst/v1/user/verify-email/${mockedId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            authCode: '12345'
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Database error');
    }));
});
describe('change user password', () => {
    it('should throw error if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(null);
        const response = yield (0, supertest_1.default)(app_1.application)
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
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
    }));
    it('should check if old password match', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue({
            password: 'old-db-password'
        });
        bcrypt_1.default.compare.mockResolvedValue(false);
        const response = yield (0, supertest_1.default)(app_1.application)
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
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('old-password', 'old-db-password');
    }));
    it('should hash new password and save in db successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            password: 'old-db-password',
            save: jest.fn().mockResolvedValue({})
        };
        userModel_1.default.findById.mockResolvedValue(mockUser);
        bcrypt_1.default.compare.mockResolvedValue(true);
        bcrypt_1.default.hash.mockResolvedValue('new-db-password');
        const response = yield (0, supertest_1.default)(app_1.application)
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
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith('old-password', 'old-db-password');
        expect(bcrypt_1.default.hash).toHaveBeenCalledWith('new-password', 10);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.password).toBe('new-db-password');
    }));
    it('should handle other errors', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockRejectedValue(new Error('Database error'));
        bcrypt_1.default.compare.mockRejectedValue(new Error('Database error'));
        bcrypt_1.default.hash.mockRejectedValue(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app_1.application)
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
    }));
});
describe('Delete user account', () => {
    it('should throw error if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue(null);
        const response = yield (0, supertest_1.default)(app_1.application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'User not found');
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
    }));
    it('should delete user and users token', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockResolvedValue({
            _id: mockedId
        });
        userModel_1.default.findByIdAndDelete.mockResolvedValue({});
        tokenModel_1.default.findOneAndDelete.mockResolvedValue({});
        const response = yield (0, supertest_1.default)(app_1.application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'User deleted successfully');
        expect(userModel_1.default.findById).toHaveBeenCalledWith(mockedId);
        expect(userModel_1.default.findByIdAndDelete).toHaveBeenCalledWith(mockedId);
        expect(tokenModel_1.default.findOneAndDelete).toHaveBeenCalledWith({ userId: mockedId });
    }));
    it('should handle other errors', () => __awaiter(void 0, void 0, void 0, function* () {
        userModel_1.default.findById.mockRejectedValue(new Error('Database error'));
        const response = yield (0, supertest_1.default)(app_1.application).delete(`/bst/v1/user/delete-account/${mockedId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Database error');
    }));
});
