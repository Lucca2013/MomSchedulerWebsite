import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

router.post("/api/login", authController.login);
router.post("/api/register", authController.register);
router.post("/api/logout", authController.logout)
router.post("/api/forgot-password", authController.forgotPassword);
router.post("/api/reset-password", authController.resetPassword);
router.get("/api/auth/status", authController.authStatus);
router.get("/api/validate-reset-token/:token", authController.validateResetToken)

export default router;
