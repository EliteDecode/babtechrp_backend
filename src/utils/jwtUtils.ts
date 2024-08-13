import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../interfaces/IUser';

const generateTokens = (user: IUser) => {
	const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
	const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
	return { accessToken, refreshToken };
};

const verifyToken = (token: string) => {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
};

const refreshTokens = (refreshToken: string) => {
	const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload & { id: IUser['_id'] };
	return generateTokens({ _id: decoded.id } as IUser);
};

export default { generateTokens, verifyToken, refreshTokens };
