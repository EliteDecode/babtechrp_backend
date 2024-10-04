import express from 'express';
import { githubAuthCallback, githubAuthHandler } from '../../../../passport/github/controllers';

const githubRoutes = express.Router();

githubRoutes.get('/github', githubAuthHandler);
githubRoutes.get('/github/callback', githubAuthCallback);

export default githubRoutes;
