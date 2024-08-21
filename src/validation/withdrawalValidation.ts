import Joi from 'joi';

export const requestWithdrawalSchema = Joi.object({
	amount: Joi.number().required().messages({
		'string.empty': 'Withdrawal amount is required.'
	})
});
