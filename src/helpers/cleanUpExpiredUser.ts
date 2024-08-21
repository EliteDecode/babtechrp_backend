import User from '../models/userModel';
import authTokenModel from '../models/authTokenModel';

// Cleanup expired tokens and delete associated users
export const cleanupExpiredTokens = async () => {
	try {
		const now = new Date();
		const expiredTokens = await authTokenModel.find({ expiresAt: { $lt: now } });

		// Parallel deletion for better performance
		await Promise.all(
			expiredTokens.map(async (token) => {
				await User.findOneAndDelete({ _id: token.userId, isEmailVerified: false });
				await authTokenModel.findByIdAndDelete(token._id);
			})
		);
	} catch (error) {
		console.error('Error during expired token cleanup:', error);
	}
};

// Cleanup tokens and user after a failed email verification
export const cleanupTokensAfterFailedEmailMessage = async ({ id }: { id: string }) => {
	try {
		await User.findOneAndDelete({ _id: id, isEmailVerified: false });
		await authTokenModel.findOneAndDelete({ userId: id });
	} catch (error) {
		console.error(`Error during cleanup after failed email for user ${id}:`, error);
	}
};
