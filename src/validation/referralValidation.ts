import Joi from 'joi';

export const addReferralSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.empty': 'Email is required.',
		'string.email': 'Email must be a valid email address.'
	}),

	fullname: Joi.string().min(3).required().messages({
		'string.empty': 'Name is required.',
		'string.min': 'Name must be at least 3 characters long.'
	}),
	address: Joi.string().min(3).required().messages({
		'string.empty': 'Address is required.',
		'string.min': 'Address must be at least 5 characters long.'
	}),
	phone: Joi.string().min(10).required().messages({
		'string.empty': 'Phone number is required.',
		'string.min': 'Phone number must be at least 10 characters long.'
	}),
	course: Joi.string().min(3).required().messages({
		'string.empty': 'Course is required.',
		'string.min': 'Course must be at least 3 characters long.'
	})
});
