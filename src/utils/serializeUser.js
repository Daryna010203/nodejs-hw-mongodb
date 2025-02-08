export const serializeUser = (user) => ({
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  id: user.id,
});
