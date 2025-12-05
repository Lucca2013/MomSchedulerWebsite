import userRepository from "../repositories/userRepository.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";
import { language } from "googleapis/build/src/apis/language/index.js";

export default {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.password !== password) return null;
    return user;
  },

  async register(username, email, password) {
    const exists = await userRepository.findByEmail(email);
    if (exists) throw new Error("User already exits");

    return await userRepository.create(username, email, password);
  },

  async passwordResetRequest(email) {
    const user = await userRepository.findByEmail(email);
    return user ?? null;
  },

  async sendResetEmail(user, language) {
    const token = generateToken(user.id);

    const link =
      process.env.NODE_ENV === "production"
        ? `https://mom-scheduler-website.vercel.app/reset-password?token=${token}`
        : `http://localhost:3000/reset-password?token=${token}`;

    await sendEmail(
      language == 'pt' ? "redefinição de senha" : "Password Redefinition",
      `<p><a href="${link}">${language == 'pt' ? "Clique aqui" : "Click here"}</a> ${language == 'pt' ? "para redefinir sua senha" : "For reset your password"}.</p>`,
      user.email
    );
  },

  async resetPassword(id, newPassword) {
    await userRepository.updatePassword(id, newPassword);
  }
};
