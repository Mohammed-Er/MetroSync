// Import packages we need
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file
dotenv.config();

// Function to connect to MongoDB database
export async function connectDB() {
  // Get MongoDB connection URL from environment variables
  const url = process.env.MONGO_URL;

  // Check if URL exists, show error if missing
  if (!url) {
    console.error("MONGO_URL is missing. Please add it to your .env file.");
    throw new Error("Missing MongoDB URL");
  }

  try {
    // Try to connect to MongoDB
    await mongoose.connect(url);
    console.log("MongoDB connected");
  } catch (err) {
    // If connection fails, show error message
    console.error("Mongo connection error:", err.message);
  }
}
