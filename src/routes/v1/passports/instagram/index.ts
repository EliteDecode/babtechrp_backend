import express from 'express';
import { instagramAuthCallback, instagramAuthHandler } from '../../../../passport/instagram/controllers';

const instagramRoutes = express.Router();

instagramRoutes.get('/instagram', instagramAuthHandler);
instagramRoutes.get('/instagram/callback', instagramAuthCallback);

export default instagramRoutes;
