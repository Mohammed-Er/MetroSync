// Import function to save socket.io instance
import { setIo } from "./ioInstance.js";

// TODO: Main function to set up all socket events

const stationViewers = {};
export default function setupSockets(io) {
  // Save io instance so other files can use it
  setIo(io);

  // Listen for new socket connections
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    let currentStationId = null;

    const updateRoomPresence = (stationId) => {
      const count = stationViewers[stationId] || 0;
      io.to(stationId).emit("presenceUpdate", { stationId, viewerCount: count });
    }
    // TODO: When user joins a station room
    socket.on("joinStation", (stationId) => {
      if (currentStationId && currentStationId !== stationId) {
        socket.leave(currentStationId);
        if (stationViewers[currentStationId] > 0) {
          stationViewers[currentStationId]--;
        }
        updateRoomPresence(currentStationId);
      }
      // Add this socket to the station room
      socket.join(stationId);
      currentStationId = stationId;
      // Count how many people are watching this station
      if (!stationViewers[stationId]) {
        stationViewers[stationId] = 0;
      }
      stationViewers[stationId]++;
      // Tell everyone in the room how many watchers there are
      updateRoomPresence(stationId);
    });

    // TODO: When user leaves a station room
    socket.on("leaveStation", (stationId) => {
      // Remove this socket from the station room
      socket.leave(stationId);
      // Count remaining watchers
      if (stationViewers[stationId] && stationViewers[stationId] > 0) {
        stationViewers[stationId]--;
      }
      
      if (currentStationId === stationId) {
        currentStationId = null;
      }

      // Update everyone with new watcher count
      updateRoomPresence(stationId);
    });

    // When socket disconnects (user closes browser/tab)
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      if (currentStationId) {
        if (stationViewers[currentStationId] > 0) {
          stationViewers[currentStationId]--;
        }
        updateRoomPresence(currentStationId);
      }
    });
  });
}
