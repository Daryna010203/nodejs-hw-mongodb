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

import {
  getFullNameFromGoogleTokenPayload,
  googleOAuthClient,
  validateCode,
} from '../utils/googleOAuth.js';

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
    'APP_DOMAIN',
  )}/auth/reset-pwd?token=${token}`;

  const template = Handlebars.compile(resetEmailTemplate);

  const html = template({
    name: user.name,
    link: resetPasswordLink,
  });

  try {
    await sendEmail({
      from: getEnvVar('SMTP_FROM'),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;
  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (error) {
    console.error(error);
    throw createHttpError(401, 'Token is expired or invalid.');
  }
  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  await SessionsCollection.deleteOne({ userId: user._id });

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: hashedPassword },
  );
};

export const getGoogleOauthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const verifyGoogleOauthCode = async (code) => {
  const ticket = await validateCode(code);

  const payload = ticket.getPayload();

  if (!payload) throw createHttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
