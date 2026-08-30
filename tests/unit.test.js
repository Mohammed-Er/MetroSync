import { jest, describe, it, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("../models/Announcement.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

const { default: Announcement } = await import("../models/Announcement.js");

const { getAnnouncementsForStation } =
  await import("../services/announcementService.js");

describe("Announcement Service Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch announcements for a given station with pagination", async () => {
    const mockStationId = "60c72b2f9b1d8b2d88f12345";

    const mockAnnouncements = [
      {
        _id: "1",
        stationId: mockStationId,
        text: "Test announcement 1",
      },
      {
        _id: "2",
        stationId: mockStationId,
        text: "Test announcement 2",
      },
    ];

    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockAnnouncements),
    };

    Announcement.find.mockReturnValue(mockQuery);

    const result = await getAnnouncementsForStation(mockStationId, 1, 10);

    expect(Announcement.find).toHaveBeenCalledWith({
      station: mockStationId,
    });

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: -1,
    });

    expect(mockQuery.skip).toHaveBeenCalledWith(0);

    expect(mockQuery.limit).toHaveBeenCalledWith(10);

    expect(result).toEqual(mockAnnouncements);
  });
});
