import express from 'express';
import { validateRequest } from '../../middleware/validationHandler';
import { registerValidationSchema } from '../../validation/userValidation';
import { registerUser } from '../../controllers/authControllers';

const authRoute = express.Router();

authRoute.post('/register', validateRequest(registerValidationSchema), registerUser);

export default authRoute;
