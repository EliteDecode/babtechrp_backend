import express from 'express';
import { validateRequest } from '../../middleware/validationHandler';
import { addStudent, deleteStudent, geSingleStudent, getStudent, updateStudent } from '../../controllers/studentControllers';
import { addReferralSchema } from '../../validation/referralValidation';
import { subAdminAuthMiddleware } from '../../middleware/adminAuthHandler';

const studentRoute = express.Router();

studentRoute.post('/', subAdminAuthMiddleware, validateRequest(addReferralSchema), addStudent);
studentRoute.get('', subAdminAuthMiddleware, getStudent);
studentRoute.get('/:studentId', subAdminAuthMiddleware, geSingleStudent);
studentRoute.put('/:studentId', subAdminAuthMiddleware, updateStudent);
studentRoute.delete('/:studentId', subAdminAuthMiddleware, deleteStudent);

export default studentRoute;
