import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export const isValidId =
  (name = 'id') =>
  (req, res, next) => {
    if (!isValidObjectId(req.params[name])) {
      next(createHttpError(400, `${name} is not a valid MongoId`));
    }
    next();
  };
