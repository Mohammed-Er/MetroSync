// Import packages we need
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Create default admin user if it doesn't exist
export async function ensureAdminSeed() {
  const adminEmail = "admin@metrosync.com";

  // Check if admin already exists
  const existing = await User.findOne({ email: adminEmail });
  if (existing) return; // Admin exists, do nothing

  // Hash (encrypt) the password for security
  const hash = await bcrypt.hash("Admin123!", 10);

  // Create new admin user in database
  await User.create({
    email: adminEmail,
    passwordHash: hash,
    role: "admin",
  });

  console.log("Seeded default admin: admin@metrosync.com / Admin123!");
}

// Login function - check if email and password are correct
export async function login(email, password) {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) return null; // User not found

  // Compare provided password with hashed password in database
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null; // Wrong password

  // Create JWT token with user info
  const payload = { userId: user._id.toString(), role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

  // Return token and user info
  return { token, role: user.role, email: user.email };
}
