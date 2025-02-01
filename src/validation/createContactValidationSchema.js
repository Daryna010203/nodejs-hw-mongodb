import Joi from 'joi';
import { TYPE } from '../constants/type.js';

export const createContactValidationSchema = Joi.object({
  name: Joi.string().required().min(3).max(20),
  phoneNumber: Joi.string().required().min(3).max(20),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .required()
    .valid(...Object.values(TYPE)),
});
