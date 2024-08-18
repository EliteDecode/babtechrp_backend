import Joi from 'joi';

export const registerValidationSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.empty': 'Email is required.',
		'string.email': 'Email must be a valid email address.'
	}),
	password: Joi.string().min(8).required().messages({
		'string.empty': 'Password is required.',
		'string.min': 'Password must be at least 8 characters long.'
	}),
	confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
		'any.only': 'Confirm password does not match.'
	}),
	fullname: Joi.string().min(3).required().messages({
		'string.empty': 'Name is required.',
		'string.min': 'Name must be at least 3 characters long.'
	}),
	phone: Joi.string().required().messages({
		'string.empty': 'Phone number is required.'
	}),
	address: Joi.string().required().messages({
		'string.empty': 'Address is required.'
	})
});

export const loginValidationSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.empty': 'Email is required.',
		'string.email': 'Email must be a valid email address.'
	}),
	password: Joi.string().required().messages({
		'string.empty': 'Password is required.'
	})
});

export const suspendAccountSchema = Joi.object({
	reason: Joi.string().optional().messages({
		'string.empty': 'Reason for suspension should be provided.'
	})
});

export const logoutValidationSchema = Joi.object({
	refreshToken: Joi.string().required().messages({
		'string.empty': 'Refresh token is required.'
	})
});

export const resetPasswordSchema = Joi.object({
	password: Joi.string().min(8).required().messages({
		'string.empty': 'Password is required.',
		'string.min': 'Password must be at least 8 characters long.'
	}),
	confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
		'any.only': 'Confirm password does not match.'
	})
});
