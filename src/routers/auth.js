import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUserValidationSchema } from '../validation/registerUserValidationSchema.js';
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  requestResetPasswordEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserValidationSchema } from '../validation/loginUserValidationSchema.js';
import { requestResetPasswordEmailValidationSchema } from '../validation/requestResetPasswordEmailValidationSchema.js';
import { resetPasswordValidationSchema } from '../validation/resetPasswordValidationSchema.js';

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
  '/request-reset-password-email',
  validateBody(requestResetPasswordEmailValidationSchema),
  ctrlWrapper(requestResetPasswordEmailController),
);
authRouter.post(
  '/reset-password',
  validateBody(resetPasswordValidationSchema),
  ctrlWrapper(resetPasswordController),
);
