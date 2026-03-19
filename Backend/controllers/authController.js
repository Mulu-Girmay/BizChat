const authService = require('../services/authService');


const sendTokenResponse = (res, statusCode, data) => {
  const cookieOptions = {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('bizchat_token', data.token, cookieOptions)
    .json({ success: true, ...data });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, storeName } = req.body;
    const result = await authService.register({ name, email, password, storeName });
    sendTokenResponse(res, 201, result);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login 
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    sendTokenResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout
const logout = (_req, res) => {
  res
    .clearCookie('bizchat_token')
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/invite-employee ──────────────────────────────────────────
const inviteEmployee = async (req, res, next) => {
  try {
    const result = await authService.inviteEmployee(req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
// ─── POST /api/auth/accept-invite 
const acceptInvite = async (req, res, next) => {
  try {
    const result = await authService.acceptInvite(req.body);
    sendTokenResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};

const requestDeletion = async (req, res, next) => {
  try {
    const result = await authService.requestDeletion(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  inviteEmployee,
  acceptInvite,
  requestDeletion,
};
