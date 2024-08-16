import User from '../models/userModel';
import authTokenModel from '../models/authTokenModel';

export const cleanupExpiredTokens = async () => {
	try {
		const now = new Date();
		const expiredTokens = await authTokenModel.find({ expiresAt: { $lt: now } });
		for (const token of expiredTokens) {
			await User.findOneAndDelete({ userId: token.userId, isEmailVerified: false });
			await authTokenModel.findByIdAndDelete(token._id);
		}
	} catch (error) {
		console.error('Error during cleanup:', error);
	}
};

export const cleanupTokensAfterFailedEmailMessage = async ({ id }: { id: string }) => {
	try {
		await User.findOneAndDelete({ userId: id, isEmailVerified: false });
		await authTokenModel.findOneAndDelete({ userId: id });
	} catch (error) {
		console.error('Error during cleanup:', error);
	}
};
