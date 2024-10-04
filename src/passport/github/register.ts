import { Strategy as GithubStrategy, Profile } from 'passport-github2';
import { generateReferralNumber } from '../../helpers/generateReferralCode';
import User from '../../models/userModel';

import '../../config/logging';
import { capitalizeFullName } from '../../helpers/generalFunctions';
import walletModel from '../../models/walletModel';

export const githubStrategy = new GithubStrategy(
	{
		clientID: process.env.GITHUB_APP_ID!,
		clientSecret: process.env.GITHUB_APP_SECRET!,
		// callbackURL: 'http://localhost:3007/bst/v1/auth/github/callback',
		// callbackURL: 'http://localhost:5173/auth/github/callback',
		callbackURL: 'https://babtechrp.com/auth/github/callback',
		passReqToCallback: true
	},
	async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: any) => {
		try {
			logging.info(profile);
			// Only look for users with githubId
			let user = await User.findOne({
				githubId: profile.id
			});

			if (!user) {
				// Check if email is already in use
				const email = profile.emails?.[0]?.value;
				if (!email) {
					throw new Error('No email provided by Github');
				}

				const existingEmailUser = await User.findOne({
					email: email.toLowerCase()
				});

				if (existingEmailUser) {
					throw new Error('Email already registered. Please use a different email or log in with your existing account.');
				}

				// Create new user
				user = new User({
					fullname: capitalizeFullName(profile.displayName),
					email: email.toLowerCase(),
					githubId: profile.id,
					isEmailVerified: true,

					isSuspended: false,
					phone: null,
					address: null,
					username: profile.username,
					referralCode: generateReferralNumber()
				});
				await user.save();
				const newWallet = new walletModel({
					userId: user._id,
					total: 0,
					withdrawn: 0,
					balance: 0,
					transactions: []
				});
				await newWallet.save();
			}

			return done(null, user);
		} catch (error: any) {
			return done(error);
		}
	}
);
