import express from "express";
import { body, param } from "express-validator";
import { listStations } from "../controllers/stationController.js";
import {
  createAnnouncementController,
  listAnnouncements
} from "../controllers/announcementController.js";

import { requireAdmin } from "../middleware/middleware.auth.js";

// Create router for station routes
const router = express.Router();

// TODO: Station CRUD endpoints
// GET /api/v1/stations - Get all stations (anyone can access)
router.get("/", listStations);
// TODO: Announcements endpoints
// GET announcements for a station (anyone can access)
router.get("/:id/announcements", listAnnouncements);
// POST new announcement (admin only)
router.post("/:id/announcements", requireAdmin,
  [
    param("id").isMongoId().withMessage("Invalid Station ID format"),
    body("text").trim().notEmpty().withMessage("Announcement text is required"),
  ],
  createAnnouncementController,
);

export default router;
