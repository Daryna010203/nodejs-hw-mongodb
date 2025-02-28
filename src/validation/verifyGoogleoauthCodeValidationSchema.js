import Joi from 'joi';

export const verifyGoogleoauthCodeValidationSchema = Joi.object({
  code: Joi.string().required(),
});
