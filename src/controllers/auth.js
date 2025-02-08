import { loginUser, registerUser } from '../services/auth.js';
import { serializeUser } from '../utils/serializeUser.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully create a user!',
    data: serializeUser(user),
  });
};

export const loginUserController = async (req, res) => {
  await loginUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully logged in a user!',
    // data: serializeUser(user),
  });
};
