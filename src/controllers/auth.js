import { ONE_MONTH } from '../constants/time.js';
import {
  getGoogleOauthUrl,
  loginUser,
  logoutUser,
  registerUser,
  requestResetPasswordEmail,
  resetPassword,
  verifyGoogleOauthCode,
} from '../services/auth.js';
import { serializeUser } from '../utils/serializeUser.js';
import { refreshUsersSession } from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully create a user!',
    data: serializeUser(user),
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId', { httpOnly: true });
  res.clearCookie('refreshToken', { httpOnly: true });

  res.status(204).send();
};

export const requestResetPasswordEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Email received for reset:', email);

    await requestResetPasswordEmail(email);

    res.json({
      status: 200,
      message: 'Successfully sent reset password link',
      data: {},
    });
  } catch (err) {
    console.error('Controller error:', err);
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body);

    res.json({
      status: 200,
      message: 'Successfully reset password',
      data: {},
    });
  } catch (err) {
    console.error('Controller error:', err);
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = getGoogleOauthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: { url },
  });
};

export const verifyGoogleOauthController = async (req, res) => {
  const { code } = req.body;
  const session = await verifyGoogleOauthCode(code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: { accessToken: session.accessToken },
  });
};
