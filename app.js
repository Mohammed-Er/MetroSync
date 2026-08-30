// Import packages we need
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Get current file and directory paths (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Allow requests from other websites (CORS)
app.use(cors());

// Parse incoming JSON data in request bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set up authentication routes
app.use("/api/v1/auth", authRoutes);
// Set up station routes
app.use("/api/v1/stations", stationRoutes);
// Health check endpoint to test if server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

export default app;
