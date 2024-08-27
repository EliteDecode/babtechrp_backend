import express from 'express';
import authMiddleware from '../../middleware/authHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { addReferral, deleteReferral, geSingleReferral, getReferral, updateReferral } from '../../controllers/referralControllers';
import { addReferralSchema } from '../../validation/referralValidation';
import { ref } from 'joi';

const referralRoute = express.Router();

referralRoute.post('/', authMiddleware, validateRequest(addReferralSchema), addReferral);
referralRoute.get('/', authMiddleware, getReferral);
referralRoute.get('/:referralId', authMiddleware, geSingleReferral);
referralRoute.put('/:referralId', authMiddleware, updateReferral);
referralRoute.delete('/:referralId', authMiddleware, deleteReferral);

export default referralRoute;
