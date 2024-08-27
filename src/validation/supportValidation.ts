import Joi from 'joi';

export const sendMessageSchema = Joi.object({
	title: Joi.string().required().messages({
		'string.empty': 'Complaint title is required.',
		'string.min': 'Name must be at least 5 characters long.'
	}),
	message: Joi.string().required().messages({
		'string.empty': 'Complaint message is required.',
		'string.min': 'Name must be at least 15 characters long.'
	})
});
