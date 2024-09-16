import express from 'express';
import { addBstUserId, deleteBstUserId, geSingleBstUserId, getBstUserIds, updateBstUserId } from '../../controllers/bstUserIdsControllers';
import { subAdminAuthMiddleware } from '../../middleware/adminAuthHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { addBstUserIdValidation } from '../../validation/bstUserIdValidation';

const bstUserIdsRoutes = express.Router();

bstUserIdsRoutes.post('/', subAdminAuthMiddleware, validateRequest(addBstUserIdValidation), addBstUserId);
bstUserIdsRoutes.get('', subAdminAuthMiddleware, getBstUserIds);
bstUserIdsRoutes.get('/:userId', subAdminAuthMiddleware, geSingleBstUserId);
bstUserIdsRoutes.put('/:userId', subAdminAuthMiddleware, updateBstUserId);
bstUserIdsRoutes.delete('/:userId', subAdminAuthMiddleware, deleteBstUserId);

export default bstUserIdsRoutes;
