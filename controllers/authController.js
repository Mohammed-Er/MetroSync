// TODO: Handle login requests
import { login } from "../services/authService.js";
import { validationResult } from "express-validator";
export async function loginController(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get email and password from request body
    const { email, password } = req.body;
    // Check if both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    // Try to login with provided credentials
    const result = await login(email, password);
    // If login failed (wrong email or password)
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    // Login successful, send back token and user info
    res.json(result);
  } catch (err) {
    // Pass any errors to error handler
    next(err);
  }
}
