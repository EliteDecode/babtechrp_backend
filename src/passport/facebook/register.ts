import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import { generateReferralNumber } from '../../helpers/generateReferralCode';
import User from '../../models/userModel';
import '../../config/logging';
import { capitalizeFullName } from '../../helpers/generalFunctions';
import walletModel from '../../models/walletModel';

export const facebookStrategy = new FacebookStrategy(
	{
		clientID: process.env.FACEBOOK_APP_ID!,
		clientSecret: process.env.FACEBOOK_APP_SECRET!,
		// callbackURL: 'http://localhost:3007/bst/v1/auth/facebook/callback',
		// callbackURL: 'http://localhost:5173/auth/facebook/callback',
		callbackURL: 'https://babtechrp.com/auth/facebook/callback',
		profileFields: ['id', 'displayName', 'email'],
		passReqToCallback: true
	},
	async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
		try {
			logging.info(profile);
			// Only look for users with facebookId
			let user = await User.findOne({
				facebookId: profile.id
			});

			if (!user) {
				// Check if email is already in use
				const email = profile.emails?.[0]?.value;
				if (!email) {
					throw new Error('No email provided by Facebook');
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
					facebookId: profile.id,
					isEmailVerified: true,
					isSuspended: false,

					phone: null,
					address: null,
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
