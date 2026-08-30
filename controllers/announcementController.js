import { validationResult } from "express-validator";
import {
  createAnnouncement,
  getAnnouncementsForStation,
} from "../services/announcementService.js";
// 1. Import getIo from your ioInstance file (adjust the path to match your folder structure)
import { getIo } from "../sockets/ioInstance.js";

export async function listAnnouncements(req, res, next) {
  try {
    const stationId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const announcements = await getAnnouncementsForStation(
      stationId,
      page,
      limit,
    );
    return res.status(200).json(announcements);
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncementController(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const stationId = req.params.id;
    const text = req.body.text;

    if (!text) {
      return res.status(400).json({ error: "Announcement text is required" });
    }

    // Create announcement in database
    const announcement = await createAnnouncement(stationId, text);

    // 2. Get socket.io instance using getIo() instead of req.app.get("io")
    const io = getIo();

    // If socket.io is available, broadcast to all users watching this station room
    if (io) {
      io.to(stationId).emit("new_announcement", announcement);
    }

    return res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}
