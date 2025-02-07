import Joi from 'joi';

export const registerUserValidationSchema = Joi.object({
  name: Joi.string().required().min(3).max(20),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
