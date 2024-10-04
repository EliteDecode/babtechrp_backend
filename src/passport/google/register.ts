import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { generateReferralNumber } from '../../helpers/generateReferralCode';
import User from '../../models/userModel';
import { GoogleProfile } from '../../interfaces/IPassport';
import '../../config/logging';
import { capitalizeFullName } from '../../helpers/generalFunctions';
import walletModel from '../../models/walletModel';

export const googleStrategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID!,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		// callbackURL: 'http://localhost:3007/bst/v1/auth/google/callback',
		// callbackURL: 'http://localhost:5173/auth/google/callback',
		callbackURL: 'https://babtechrp.com/auth/google/callback',
		passReqToCallback: true
	},
	async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
		try {
			// Only look for users with googleId
			let user = await User.findOne({
				googleId: profile.id
			});

			if (!user) {
				// Check if email is already in use
				const email = profile.emails?.[0]?.value;
				if (!email) {
					throw new Error('No email provided by Google');
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
					googleId: profile.id,
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
