import { OAuth2Client } from 'google-auth-library';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

export const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: getEnvVar('RIDERECT_URI'),
});

export const validateCode = async (code) => {
  const response = await googleOAuthClient.getToken(code);

  if (!response.tokens.id_token) throw createHttpError(401, 'Unauthorized');

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });

  return ticket;
};

export const getFullNameFromGoogleTokenPayload = (payload) => {
  if (payload.given_name && payload.family_name) {
    return `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    return payload.given_name;
  } else {
    return 'Guest';
  }
};
