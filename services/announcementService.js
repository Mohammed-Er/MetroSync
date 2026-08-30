// TODO: Get all announcements for a specific station (newest first)
import Announcement from "../models/Announcement.js";

export async function getAnnouncementsForStation(stationId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return await Announcement.find({ station: stationId })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
}

// TODO: Create a new announcement for a station
export async function createAnnouncement(stationId, text) {
  // Create announcement in database
  const doc = await Announcement.create({ station: stationId, message: text });
  // Convert to plain JavaScript object and return
  return doc.toObject();
}
