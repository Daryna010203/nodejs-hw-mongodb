import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUserValidationSchema } from '../validation/registerUserValidationSchema.js';
import {
  getGoogleOAuthUrlController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  requestResetPasswordEmailController,
  resetPasswordController,
  verifyGoogleOauthController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserValidationSchema } from '../validation/loginUserValidationSchema.js';
import { requestResetPasswordEmailValidationSchema } from '../validation/requestResetPasswordEmailValidationSchema.js';
import { resetPasswordValidationSchema } from '../validation/resetPasswordValidationSchema.js';
import { verifyGoogleoauthCodeValidationSchema } from '../validation/verifyGoogleoauthCodeValidationSchema.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerUserValidationSchema),
  ctrlWrapper(registerUserController),
);
authRouter.post(
  '/login',
  validateBody(loginUserValidationSchema),
  ctrlWrapper(loginUserController),
);
authRouter.post('/refresh-session', ctrlWrapper(refreshUserSessionController));
authRouter.post('/logout', ctrlWrapper(logoutUserController));

authRouter.post(
  '/send-reset-email',
  validateBody(requestResetPasswordEmailValidationSchema),
  ctrlWrapper(requestResetPasswordEmailController),
);
authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordValidationSchema),
  ctrlWrapper(resetPasswordController),
);

authRouter.get(
  '/get-google-oauth-url',
  ctrlWrapper(getGoogleOAuthUrlController),
);

authRouter.post(
  '/verify-google-code',
  validateBody(verifyGoogleoauthCodeValidationSchema),
  ctrlWrapper(verifyGoogleOauthController),
);
