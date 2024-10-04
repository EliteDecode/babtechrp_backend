import express from 'express';
import { facebookAuthCallback, facebookAuthHandler } from '../../../../passport/facebook/controllers';

const facebookRoutes = express.Router();

facebookRoutes.get('/facebook', facebookAuthHandler);
facebookRoutes.get('/facebook/callback', facebookAuthCallback);

export default facebookRoutes;
