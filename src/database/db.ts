import { SERVER } from '../config/config';

const mongoose = require('mongoose');

export const connectDb = async () => {
	try {
		const conn = await mongoose.connect(SERVER.MONGODB_URI);
		logging.log('-------------------------------------------');
		logging.log(`MongoDB Connected: ${conn.connection.host}`);
		logging.log('-------------------------------------------');
	} catch (error) {
		logging.error('-------------------------------------------');
		logging.error(error);
		logging.error('-------------------------------------------');
		process.exit(1);
	}
};
