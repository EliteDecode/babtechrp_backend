import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwtUtils from '../../utils/jwtUtils';
import tokenModel from '../../models/tokenModel';

export const githubAuthHandler = passport.authenticate('github', { scope: ['user:email'] });

export const githubAuthCallback = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('github', async (err: any, user: any) => {
		try {
			if (err) {
				return res.status(400).json({
					success: false,
					message: err.message,
					data: null
				});
			}

			if (!user) {
				throw new Error('Authentication failed: No user returned');
			}

			// Generate tokens using your existing token generation logic
			const tokens = jwtUtils.generateTokens(user);

			const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
			const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

			const checkExistingTokens = await tokenModel.findOne({ userId: user._id });

			if (checkExistingTokens) {
				await tokenModel.findOneAndUpdate({ userId: user._id }, { refreshToken: tokens.refreshToken, expiresAt: expiresAt });
			} else {
				await tokenModel.create({ userId: user._id, refreshToken: tokens.refreshToken, expiresAt: expiresAt });
			}

			return res.status(200).json({
				success: true,
				message: 'Github authentication successful',
				data: {
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken
				}
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	})(req, res, next);
};
