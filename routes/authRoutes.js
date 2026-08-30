import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { loginController } from "../controllers/authController.js";

const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginValidationRules = [
  body("email").isEmail().withMessage("Must be a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
// Create router for authentication routes
const router = express.Router();

// POST /api/v1/auth/login - Login endpoint
router.post("/login", loginRateLimiter, loginValidationRules, loginController);

export default router;
