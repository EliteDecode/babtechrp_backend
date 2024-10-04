import express from 'express';
import { googleAuthCallback, googleAuthHandler } from '../../../../passport/google/controllers';

const googleRoutes = express.Router();

googleRoutes.get('/google', googleAuthHandler);
googleRoutes.get('/google/callback', googleAuthCallback);

export default googleRoutes;
