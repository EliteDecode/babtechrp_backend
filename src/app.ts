import express from 'express';
import { loggingHandler } from './middleware/loggingHandler';
import { corsHandler } from './middleware/corsHandler';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes/v1';
import './config/logging';
import cron from 'node-cron';
import { cleanupExpiredTokens } from './helpers/cleanUpExpiredUser';
import passport from 'passport';
import { googleStrategy } from './passport/google/register';
import { facebookStrategy } from './passport/facebook/register';
import { instagramStrategy } from './passport/instagram/register';
import { githubStrategy } from './passport/github/register';

const application = express();

logging.info('-------------------------------------------');
logging.info('Starting the application');
logging.info('-------------------------------------------');
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

logging.info('-------------------------------------------');
logging.info('Logging & Configuration');
logging.info('-------------------------------------------');
application.use(loggingHandler);
application.use(corsHandler);

logging.info('-------------------------------------------');
logging.info('Errors Handling');
logging.info('-------------------------------------------');
application.use(errorHandler);

//InitializePassport
application.use(passport.initialize());

// Add strategies
passport.use(googleStrategy);
passport.use(facebookStrategy);
passport.use(instagramStrategy);
passport.use(githubStrategy);

//v1 api routes
application.use('/bst/v1', routes);

//Cleanup
cron.schedule('* * * * *', async () => {
	await cleanupExpiredTokens();
});

export { application };
