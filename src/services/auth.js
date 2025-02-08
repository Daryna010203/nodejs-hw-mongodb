import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';

import bcrypt from 'bcrypt';

export const registerUser = async ({ email, password, name }) => {
  const user = await UsersCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use!');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return await UsersCollection.create({
    email,
    password: hashedPassword,
    name,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const arePasswordsEqual = await bcrypt.compare(password, user.password);
  if (!arePasswordsEqual) {
    throw createHttpError(401, 'User or passwors is incorrect!');
  }
};
