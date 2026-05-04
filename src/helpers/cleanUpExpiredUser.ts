import authTokenModel from '../models/authTokenModel';

// Delete expired auth tokens only — do NOT delete the user
export const cleanupExpiredTokens = async () => {
	try {
		const now = new Date();
		await authTokenModel.deleteMany({ expiresAt: { $lt: now } });
	} catch (error) {
		console.error('Error during expired token cleanup:', error);
	}
};

// Delete the token after a failed email send — do NOT delete the user
export const cleanupTokensAfterFailedEmailMessage = async ({ id }: { id: string }) => {
	try {
		await authTokenModel.deleteMany({ userId: id });
	} catch (error) {
		console.error(`Error during token cleanup after failed email for user ${id}:`, error);
	}
};
