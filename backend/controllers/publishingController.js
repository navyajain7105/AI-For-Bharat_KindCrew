
import publishingService from "../services/publishing.service.js";

/**
 * Schedule new content
 */
export const scheduleContent = async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const payload = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await publishingService.scheduleContent(userId, payload);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in scheduleContent:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * List scheduled items for user
 */
export const listSchedules = async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const items = await publishingService.listSchedules(userId);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Error in listSchedules:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update existing schedule
 */
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await publishingService.updateSchedule(id, updates);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in updateSchedule:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Trigger immediate posting (stub)
 */
export const postNow = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await publishingService.postNow(id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in postNow:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Format content for a specific platform (stubbed)
 */
export const formatContent = async (req, res) => {
  try {
    const { id, platform } = req.params;
    // in a real implementation you would look up the content etc
    res.status(200).json({ success: true, data: { platform, formatted: "" } });
  } catch (error) {
    console.error("Error in formatContent:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create calendar event for existing schedule
 */
export const addCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.body;
    if (!accessToken) {
      return res
        .status(400)
        .json({ success: false, error: "accessToken is required" });
    }
    const event = await publishingService.addCalendarEvent(id, accessToken);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Error in addCalendarEvent:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
