import mongoose from "mongoose";

// Define structure for Announcement documents in database
const announcementSchema = new mongoose.Schema({
  station: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Station", 
    required: true 
  }, 
  message: {
    type: String, 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }, // When it was created
});

// Export Announcement model (creates "announcements" collection)
export default mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
