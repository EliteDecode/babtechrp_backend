import express from 'express';
import authMiddleware from '../../middleware/authHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { addReferral, deleteReferral, geSingleReferral, getReferral, updateReferral } from '../../controllers/referralControllers';
import { addReferralSchema } from '../../validation/referralValidation';
import { ref } from 'joi';

const referralRoute = express.Router();

referralRoute.post('/:userId', authMiddleware, validateRequest(addReferralSchema), addReferral);
referralRoute.get('/:userId', authMiddleware, getReferral);
referralRoute.get('/:userId/:referralId', authMiddleware, geSingleReferral);
referralRoute.put('/:userId/:referralId', authMiddleware, updateReferral);
referralRoute.delete('/:userId/:referralId', authMiddleware, deleteReferral);

export default referralRoute;
