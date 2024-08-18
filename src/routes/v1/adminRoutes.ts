import express, { Request, Response } from 'express';
import { adminAuthMiddleware, subAdminAuthMiddleware } from '../../middleware/adminAuthHandler';
import { validateRequest } from '../../middleware/validationHandler';
import { loginValidationSchema, registerValidationSchema } from '../../validation/adminValidation';
import {
	createSubAdmin,
	deleteSubAdmin,
	fetchAdmin,
	loginAdmin,
	logoutAdmin,
	suspendSubAdmin,
	updateSubAdmin
} from '../../controllers/adminControllers';

const adminRoute = express.Router();

adminRoute.post('/login', validateRequest(loginValidationSchema), loginAdmin);
adminRoute.post('/register', adminAuthMiddleware, validateRequest(registerValidationSchema), createSubAdmin);
adminRoute.put('/update/:adminId', subAdminAuthMiddleware, updateSubAdmin);
adminRoute.delete('/delete/:adminId', adminAuthMiddleware, deleteSubAdmin);
adminRoute.put('/suspend/:adminId', adminAuthMiddleware, suspendSubAdmin);
adminRoute.delete('/logout', adminAuthMiddleware, logoutAdmin);
adminRoute.get('/', subAdminAuthMiddleware, fetchAdmin);
export default adminRoute;
