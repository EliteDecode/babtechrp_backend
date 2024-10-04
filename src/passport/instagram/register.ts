import { Strategy as InstagramStrategy } from 'passport-instagram';
import { generateReferralNumber } from '../../helpers/generateReferralCode';
import User from '../../models/userModel';
import '../../config/logging';

export const instagramStrategy = new InstagramStrategy(
	{
		clientID: process.env.INSTAGRAM_APP_ID!,
		clientSecret: process.env.INSTAGRAM_APP_SECRET!,
		callbackURL: 'http://localhost:3007/bst/v1/auth/instagram/callback',
		passReqToCallback: true
	},
	async (req: any, accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
		try {
			logging.info(profile);
			// Only look for users with instagramId
			let user = await User.findOne({
				instagramId: profile.id
			});

			if (!user) {
				// Instagram Basic Display API doesn't provide email, so we can't check for existing email
				// Create new user
				user = new User({
					fullname: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
					instagramId: profile.id,
					username: profile.username,
					isEmailVerified: false, // Since we don't get email from Instagram
					isSuspended: false,
					phone: null,
					address: null,
					referralCode: generateReferralNumber()
				});
				await user.save();
			}

			return done(null, user);
		} catch (error: any) {
			return done(error);
		}
	}
);
