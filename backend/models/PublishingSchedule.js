
/**
 * PublishingSchedule Model
 * Represents a scheduled piece of content for publishing
 * Stores metadata needed for posting and optional calendar integration
 */

class PublishingSchedule {
  /**
   * Create a new schedule object with defaults
   * @param {string} scheduleId
   * @param {Object} data
   */
  static create(scheduleId, data) {
    const now = new Date().toISOString();

    return {
      scheduleId,
      contentId: data.contentId,
      userId: data.userId,
      platform: data.platform,
      scheduledTime: data.scheduledTime, // ISO string or Date
      status: data.status || "scheduled",
      autoPost: data.autoPost ?? false,
      formattedContent: data.formattedContent || null,
      postResult: data.postResult || null,
      calendarEventId: data.calendarEventId || null,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Validate schedule payload before saving
   * @param {Object} data
   * @returns {{valid: boolean, errors: string[]}}
   */
  static validate(data) {
    const errors = [];

    if (!data.userId || typeof data.userId !== "string") {
      errors.push("userId is required");
    }
    if (!data.contentId || typeof data.contentId !== "string") {
      errors.push("contentId is required");
    }
    if (!data.platform || typeof data.platform !== "string") {
      errors.push("platform is required");
    }
    if (!data.scheduledTime) {
      errors.push("scheduledTime is required");
    }
    // scheduledTime should be a valid date
    if (data.scheduledTime && isNaN(new Date(data.scheduledTime).getTime())) {
      errors.push("scheduledTime must be a valid date");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PublishingSchedule;
