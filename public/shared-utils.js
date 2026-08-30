// ===== SHARED UTILITIES FOR PASSENGER AND ADMIN =====

// Train animation timing configuration
export const TRAIN_CONFIG = {
  STOP_TIME: 3000,  // Stop at each station for 3 seconds
  MOVE_TIME: 12000, // Move between stations in 12 seconds
};

// Shared app state
export const appState = {
  stations: [],
  currentStationId: null,
  currentTrainStationId: null,
  trainElement: null,
  currentTrainIndex: 0,
  isMovingForward: true,
};

// Move train to a specific station position
export function updateTrainPosition(index, isMoving = false) {
  if (appState.stations.length === 0) return;

  const trainPosition = (index / (appState.stations.length - 1)) * 100;

  if (isMoving) {
    appState.trainElement.style.transition = `left ${
      TRAIN_CONFIG.MOVE_TIME / 1000
    }s ease-in-out`;
  } else {
    appState.trainElement.style.transition = "none";
  }

  appState.trainElement.style.left = `calc(${trainPosition}% - 24px)`;
  appState.currentTrainIndex = index;
  appState.currentTrainStationId = appState.stations[index].id;
}

// Start the train animation loop
export function startClientSideTrainAnimation() {
  if (appState.stations.length === 0) return;

  const moveToNextStation = () => {
    updateTrainPosition(appState.currentTrainIndex, false);

    setTimeout(() => {
      if (appState.isMovingForward) {
        if (appState.currentTrainIndex < appState.stations.length - 1) {
          appState.currentTrainIndex++;
        } else {
          appState.isMovingForward = false;
          appState.currentTrainIndex--;
        }
      } else {
        if (appState.currentTrainIndex > 0) {
          appState.currentTrainIndex--;
        } else {
          appState.isMovingForward = true;
          appState.currentTrainIndex++;
        }
      }

      updateTrainPosition(appState.currentTrainIndex, true);
      setTimeout(moveToNextStation, TRAIN_CONFIG.MOVE_TIME);
    }, TRAIN_CONFIG.STOP_TIME);
  };

  moveToNextStation();
}

// Draw all station dots on the map
export function renderMap(mapLine) {
  const existingDots = mapLine.querySelectorAll(".station-dot");
  existingDots.forEach((dot) => dot.remove());

  appState.stations.forEach((s, index) => {
    const dot = document.createElement("div");
    dot.className =
      "station-dot" + (s.id === appState.currentStationId ? " selected" : "");
    dot.dataset.id = s.id;
    dot.dataset.index = index;

    const label = document.createElement("span");
    label.textContent = s.name;
    dot.appendChild(label);

    mapLine.appendChild(dot);
  });
}

// Create and initialize the train element
export function initializeTrain(mapLine) {
  if (!appState.trainElement) {
    appState.trainElement = document.createElement("div");
    appState.trainElement.className = "train-icon";
    appState.trainElement.textContent = "🚆";
    mapLine.appendChild(appState.trainElement);
  }

  appState.currentTrainIndex = 0;
  updateTrainPosition(0, false);
}

// Populate station dropdown with options
export function populateStationDropdown(selectElement) {
  selectElement.innerHTML =
    "<option value=''>Select Station</option>" +
    appState.stations
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join("");
}

// Get announcements for a specific station
export async function loadAnnouncements(stationId, token = null) {
  const headers = token ? { Authorization: "Bearer " + token } : {};
  const res = await fetch(`/api/v1/stations/${stationId}/announcements`, {
    headers,
  });
  return await res.json();
}

// Add one announcement to the list
export function addAnnouncementToList(
  announcementList,
  announcement,
  toTop = false
) {
  const li = document.createElement("li");
  li.className = "announcement-item";

  const time = new Date(announcement.createdAt || Date.now());
  const announcementText = announcement.text || announcement.message || "";

  li.innerHTML = `
    <div>${announcementText}</div>
    <time>${time.toLocaleTimeString()}</time>
  `;

  if (toTop && announcementList.firstChild) {
    announcementList.insertBefore(li, announcementList.firstChild);
  } else {
    announcementList.appendChild(li);
  }
}

// Display all announcements in the list
export function displayAnnouncements(announcementList, announcements) {
  announcementList.innerHTML = "";
  
  // Handle both raw array responses and paginated { data: [...] } responses
  const list = Array.isArray(announcements)
    ? announcements
    : announcements?.data || [];

  list.forEach((a) => addAnnouncementToList(announcementList, a, false));
}

// Load stations from server with optional token
export async function fetchStations(token = null) {
  const headers = token ? { Authorization: "Bearer " + token } : {};
  const res = await fetch("/api/v1/stations", { headers });
  return await res.json();
}

// Try to use preloaded stations or fetch from server
export async function loadStationsWithPreload(token = null) {
  let fetchedStations = [];
  if (
    window.preloadedData &&
    window.preloadedData.stations &&
    window.preloadedData.stations.length > 0
  ) {
    console.log("Using preloaded stations");
    fetchedStations = window.preloadedData.stations;
  } else {
    console.log("Fetching stations (preload not available)");
    fetchedStations = await fetchStations(token);
  }

  // FIX: Map MongoDB _id to id so s.id works across the app
  return fetchedStations.map((s) => ({
    ...s,
    id: s._id || s.id,
  }));
}

// Handle station selection change
export function handleStationChange(
  socket,
  newStationId,
  titleElements,
  announcementList,
  mapLine,
  token = null
) {
  return async () => {
    if (!newStationId) return;

    // Leave previous station room
    if (appState.currentStationId) {
      socket.emit("leaveStation", appState.currentStationId);
    }

    // Join new station room
    appState.currentStationId = newStationId;
    const selectedStation = appState.stations.find(
      (s) => s.id === newStationId
    );
    const stationName = selectedStation ? selectedStation.name : "Select Station";

    // Update all title elements
    titleElements.forEach((el) => {
      if (el) el.textContent = stationName;
    });

    // Tell server we joined this station
    socket.emit("joinStation", appState.currentStationId);

    // Load announcements for this station
    const announcements = await loadAnnouncements(
      appState.currentStationId,
      token
    );
    displayAnnouncements(announcementList, announcements);

    // Update map to highlight selected station
    renderMap(mapLine);
  };
}

// Setup socket event listeners
export function setupSocketListeners(socket, announcementList, viewersText) {
  // FIX: Listen for 'new_announcement' event sent by backend
  socket.on("new_announcement", (a) => {
    const announcementStationId = a.stationId || a.station;
    if (announcementStationId === appState.currentStationId) {
      addAnnouncementToList(announcementList, a, true);
    }
  });

  // FIX: Listen for 'viewerCount' property in presenceUpdate
  socket.on("presenceUpdate", ({ stationId, viewerCount, watchers }) => {
    const count = viewerCount !== undefined ? viewerCount : watchers;
    if (stationId === appState.currentStationId && viewersText) {
      viewersText.textContent = "Live viewers: " + count;
    }
  });
}