import jwt from "jsonwebtoken";
// TODO: Middleware to check if user is an admin
export function requireAdmin(req, res, next) {
  // Get authorization header from request
  // Split "Bearer token123" into ["Bearer", "token123"]
  const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
  // Check if token is provided in correct format
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
}
  try {
    // Verify token and decode the data inside it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user has admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    // Save user info to request for next middleware/controller
    req.user = decoded;
    // User is admin, continue to next function
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ message: "Invalid token" });
  }
}