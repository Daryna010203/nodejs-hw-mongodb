import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, ONE_MONTH } from '../constants/time.js';
import { SessionsCollection } from '../db/models/session.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { TEMPLATES_DIR_PATH } from '../constants/path.js';

const resetEmailTemplate = fs
  .readFileSync(path.join(TEMPLATES_DIR_PATH, 'reset-password-email.html'))
  .toString();

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
    throw createHttpError(401, 'User or password is incorrect!');
  }

  await SessionsCollection.deleteMany({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_MONTH),
  });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_MONTH),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetPasswordEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const token = jwt.sign({ sub: user._id, email }, getEnvVar('JWT_SECRET'), {
    expiresIn: '15m',
  });

  const resetPasswordLink = `${getEnvVar(
    'FRONTEND_DOMAIN',
  )}/reset-password?token=${token}`;

  const template = Handlebars.compile(resetEmailTemplate);

  const html = template({
    name: user.name,
    link: resetPasswordLink,
  });

  await sendEmail({
    to: email,
    subject: 'Reset password',
    from: getEnvVar('SMTP_FROM'),
    html,
  });
};
