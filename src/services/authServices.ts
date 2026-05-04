//1. Register User
//2. Verify User
//3. Resend Verification
//4. Login User
//5. Logout
//6. Forgot Password
//7. Reset Password

import jwtUtils from '../utils/jwtUtils';
import User from '../models/userModel';
import tokenModel from '../models/tokenModel';
import bcrypt from 'bcrypt';
import sendMail from '../utils/emailUtils';
import authTokenModel from '../models/authTokenModel';
import { cleanupTokensAfterFailedEmailMessage } from '../helpers/cleanUpExpiredUser';
import { IToken } from '../interfaces/IToken';
import { generateReferralNumber } from '../helpers/generateReferralCode';
import { IParams } from '../interfaces/IParams';
import { JwtPayload } from 'jsonwebtoken';
import { IUser, IUserLogin } from '../interfaces/IUser';
import walletModel from '../models/walletModel';

// ── shared email builders ──────────────────────────────────────────────────

const emailWrapper = (body: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,100,0.10);max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#000066 0%,#0a0a8a 100%);padding:28px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a0aad4;">Babtech School of Technology</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">BST Referral Platform</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #eef0f8;padding:18px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a0aec0;">
                &copy; ${new Date().getFullYear()} Babtech School of Technology &bull; All rights reserved
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#a0aec0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const verificationEmailBody = (name: string, code: string) => emailWrapper(`
  <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a2e;">Verify your email ✉️</h2>
  <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
    Hi <strong>${name}</strong>, welcome to BST! Use the code below to verify your email address.
    It expires in <strong>5 minutes</strong>.
  </p>

  <div style="background:#f0f4ff;border:2px solid #000066;border-radius:12px;padding:24px 16px;text-align:center;margin:0 0 24px;">
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;">Your verification code</p>
    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#000066;">${code}</p>
  </div>

  <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
    Enter this code on the verification page to activate your account.
  </p>
`);

const passwordResetEmailBody = (name: string, resetUrl: string) => emailWrapper(`
  <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a2e;">Reset your password 🔑</h2>
  <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
    Hi <strong>${name}</strong>, we received a request to reset your BST account password.
    Click the button below — this link expires in <strong>5 minutes</strong>.
  </p>

  <div style="text-align:center;margin:0 0 28px;">
    <a href="${resetUrl}"
      style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;background:linear-gradient(135deg,#000066 0%,#0a0a8a 100%);text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
      Reset Password
    </a>
  </div>

  <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
    If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="${resetUrl}" style="color:#000066;word-break:break-all;">${resetUrl}</a>
  </p>
`);

// ── service functions ──────────────────────────────────────────────────────

export const register_user = async (params: IParams) => {
	try {
		const userData = params.data;

		const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
		if (existingUser) {
			const getAuthCode = await authTokenModel.findOne({
				userId: existingUser._id,
				expiresAt: { $gt: new Date() }
			});
			if (getAuthCode) {
				throw new Error('A valid verification code already exists. Please use it or wait for it to expire.');
			}
			throw new Error('User with this email already exists. Please login or use a different email.');
		}

		const hashedPassword = await bcrypt.hash(userData.password, 10);

		const newUser = new User({
			fullname: userData.fullname,
			email: userData.email.toLowerCase(),
			password: hashedPassword,
			isEmailVerified: false,
			isSuspended: false,
			phone: null,
			address: null,
			referralCode: generateReferralNumber()
		});

		try {
			await newUser.save();
			const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
			const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

			await authTokenModel.create({
				userId: newUser._id,
				authCode: hashedVerificationCode,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000)
			});

			await sendMail({
				email: newUser.email,
				subject: 'Verify your BST email address',
				text: verificationEmailBody(newUser.fullname, verificationCode)
			});
		} catch (emailError: any) {
			await cleanupTokensAfterFailedEmailMessage({ id: newUser._id as string });
			throw new Error(`Error sending verification email: ${emailError.message}`);
		}

		return {
			success: true,
			message: 'Registration successful. Please check your email for the verification code.',
			data: { _id: newUser._id, email: newUser.email }
		};
	} catch (error: any) {
		throw new Error(`Error registering user ${error.message}`);
	}
};

export const resend_verification = async (params: { query: { userId: string } }) => {
	try {
		const { userId } = params.query;

		const user = await User.findById(userId);
		if (!user) throw new Error('User not found');
		if (user.isEmailVerified) throw new Error('Email is already verified');

		await authTokenModel.deleteMany({ userId: user._id });

		const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
		const hashedCode = await bcrypt.hash(verificationCode, 10);

		await authTokenModel.create({
			userId: user._id,
			authCode: hashedCode,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		});

		await sendMail({
			email: user.email,
			subject: 'Your new BST verification code',
			text: verificationEmailBody(user.fullname, verificationCode)
		});

		return {
			success: true,
			message: 'A new verification code has been sent to your email.',
			data: null
		};
	} catch (error: any) {
		throw new Error(`Error resending verification: ${error.message}`);
	}
};

export const verify_user_token = async (params: { data: IToken; query: { userId: string } }) => {
	try {
		const userAuthInfo = params.data;
		const { userId } = params.query;

		const fetchUserToken = await authTokenModel.findOne({
			userId: userId,
			expiresAt: { $gt: new Date() }
		});

		if (!fetchUserToken || !fetchUserToken.authCode) {
			throw new Error('Verification code is incorrect');
		}

		const isMatch = userAuthInfo.authCode && (await bcrypt.compare(userAuthInfo.authCode.toString(), fetchUserToken.authCode));
		if (!isMatch) {
			throw new Error('Invalid or expired verification code');
		}

		const updateUser = await User.findByIdAndUpdate(fetchUserToken.userId, { isEmailVerified: true }, { new: true });
		const newWallet = new walletModel({
			userId: fetchUserToken.userId,
			total: 0,
			withdrawn: 0,
			balance: 0,
			transactions: []
		});
		await newWallet.save();

		await authTokenModel.findByIdAndDelete(fetchUserToken._id);

		return {
			success: true,
			message: 'Email successfully verified',
			data: updateUser
		};
	} catch (error: any) {
		throw new Error(`Error verifying user token: ${error.message}`);
	}
};

export const login_user = async (params: { data: IUserLogin }) => {
	const { email, password } = params.data;
	const user = await User.findOne({ email: email.toLowerCase() });
	if (!user) throw new Error('User not found');
	if (user.isSuspended) throw new Error('Your account has been suspended');
	if (!user.isEmailVerified) throw new Error(`UNVERIFIED_EMAIL:${user._id}:${user.email}`);

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) throw new Error('Invalid password');

	const tokens = jwtUtils.generateTokens(user);
	try {
		const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;
		const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

		const checkExistingTokens = await tokenModel.findOne({ userId: user._id });
		if (checkExistingTokens) {
			await tokenModel.findOneAndUpdate({ userId: user._id }, { refreshToken: tokens.refreshToken, expiresAt });
		} else {
			await tokenModel.create({ userId: user._id, refreshToken: tokens.refreshToken, expiresAt });
		}

		return {
			success: true,
			message: 'Login successful',
			data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
		};
	} catch (error: any) {
		throw new Error('Error logging in, please try again');
	}
};

export const logout_user = async (params: { data: { refreshToken: string } }) => {
	const { refreshToken } = params.data;
	try {
		const result = await tokenModel.findOneAndDelete({ refreshToken });
		if (!result) throw new Error('Refresh token not found');
		return { success: true, message: 'Logout successful', data: null };
	} catch (error: any) {
		throw new Error(`Error logging out user: ${error.message}`);
	}
};

export const forgot_password = async (params: IParams) => {
	const { email } = params.data;

	const fetchUser = await User.findOne({ email: email.toLowerCase() });
	if (!fetchUser) throw new Error('User with this email does not exist');

	const checkUserWithToken = await authTokenModel.findOne({ userId: fetchUser._id });
	if (checkUserWithToken) throw new Error('A valid reset code already exists. Please use it or wait for it to expire.');

	try {
		const resetToken = jwtUtils.generateResetToken(fetchUser);
		const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

		await sendMail({
			email: fetchUser.email,
			subject: 'Reset your BST password',
			text: passwordResetEmailBody(fetchUser.fullname, resetUrl)
		});

		await authTokenModel.create({
			userId: fetchUser._id,
			authCode: resetToken,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		});

		return { success: true, message: 'Password reset email sent successfully', data: resetToken };
	} catch (error) {
		await cleanupTokensAfterFailedEmailMessage({ id: fetchUser._id as string });
		throw new Error(`Error sending password reset email: ${error}`);
	}
};

export const reset_password = async (params: { data: { password: string; token: string } }) => {
	const { password, token } = params.data;

	const decoded = jwtUtils.verifyToken(token) as JwtPayload;
	const fetchUser = await User.findById(decoded.id);
	if (!fetchUser) throw new Error('Invalid or expired reset token');

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
		return { success: true, message: 'Password reset successful', data: null };
	} catch (error) {
		throw new Error(`Error resetting password: ${error}`);
	}
};

export const get_access_token = async (params: { data: IToken }) => {
	try {
		const token = params.data;

		const checkExistingTokens = await tokenModel.findOne({ refreshToken: token.refreshToken });
		if (!checkExistingTokens) throw new Error('Invalid refresh token');

		const decoded = jwtUtils.verifyRefreshToken(token.refreshToken) as JwtPayload & { id: IUser['_id'] };
		if (!decoded) throw new Error('Invalid refresh token');

		const user = await User.findById(decoded.id);
		const tokens = jwtUtils.generateTokens(user as IUser);
		const refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000;

		await tokenModel.findOneAndUpdate(
			{ userId: user?._id },
			{ refreshToken: tokens.refreshToken, expiresAt: new Date(Date.now() + refreshTokenExpiresIn) }
		);

		return {
			success: true,
			message: 'Access token generated successfully',
			data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
		};
	} catch (error) {
		throw new Error(`Error generating access token: ${error}`);
	}
};
