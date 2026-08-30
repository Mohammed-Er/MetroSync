import { getAllStations } from "../services/stationService.js";
// Import the announcement service (adjust the path if necessary)
import { getAnnouncementsForStation } from "../services/announcementService.js"; 

// GET /api/v1/stations - Get list of all stations
export async function listStations(req, res, next) {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/stations/:id/announcements - Get all announcements for a station
export async function stationAnnouncements(req, res, next) {
  try {
    const stationId = req.params.id;
    
    // Support pagination from the query string (e.g., ?page=1&limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const announcements = await getAnnouncementsForStation(stationId, page, limit);
    
    // You were missing this line to actually send the data back to the browser!
    return res.status(200).json(announcements);
  } catch (err) {
    next(err);
  }
}