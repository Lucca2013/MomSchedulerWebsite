import authService from "../services/authService.js";
import verifyToken from "../utils/jwt.js";

export default {
  async login(req, res) {
    const { email, password } = req.body;

    const user = await authService.login(email, password);
    if (!user)
      return res.status(401).json({ error: "Invalid Credentials" });

    await req.login(user);

    res.json({
      message: "Login concluded",
      user: req.session.user
    });
  },

  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const user = await authService.register(username, email, password);
      res.status(201).json({ user });
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  },

  async logout(req, res) {
    await new Promise((resolve, reject) => {
      req.session.destroy(err => err ? reject(err) : resolve());
    });

    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
  },

  async forgotPassword(req, res) {
    const { email, language } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await authService.passwordResetRequest(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await authService.sendResetEmail(user, language);

    return res.status(200).json({ success: true, message: "Reset email sent" });
  },


  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const decoded = verifyToken(token);
      await authService.resetPassword(decoded.userId, newPassword);

      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Expired or invalid token" });
    }
  },

  async authStatus(req, res) {
    res.json({
      authenticated: req.authenticate(),
      user: req.session.user
    });
  },

  async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ valid: false, reason: "missing_token" });
      }

      verifyToken(token);

      return res.status(200).json({ valid: true });
    } catch (err) {
      return res.status(400).json({
        valid: false,
        reason: "expired_or_invalid",
        message: err.message
      });
    }
  }
};
