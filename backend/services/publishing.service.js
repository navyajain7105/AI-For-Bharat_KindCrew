
/**
 * Publishing Service
 * Business logic for scheduling and posting content
 */

import { v4 as uuidv4 } from "uuid";
import dynamoDBService from "./dynamodb.service.js";
import PublishingSchedule from "../models/PublishingSchedule.js";
import calendarService from "./calendarService.js";

class PublishingService {
  /**
   * Schedule content for a future time
   */
  async scheduleContent(userId, payload) {
    // payload expected to contain: contentId, platform, scheduledTime, autoPost?, formattedContent?
    const scheduleData = {
      scheduleId: uuidv4(),
      userId,
      contentId: payload.contentId,
      platform: payload.platform,
      scheduledTime: payload.scheduledTime,
      status: "scheduled",
      autoPost: payload.autoPost || false,
      formattedContent: payload.formattedContent || null,
      postResult: null,
      calendarEventId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = PublishingSchedule.validate(scheduleData);
    if (!validation.valid) {
      throw new Error("Invalid schedule: " + validation.errors.join(", "));
    }

    const result = await dynamoDBService.createPublishingSchedule(scheduleData);
    return result;
  }

  /**
   * List all scheduled posts for a user
   */
  async listSchedules(userId) {
    return await dynamoDBService.getPublishingSchedulesByUserId(userId);
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(scheduleId, updates) {
    // allow partial updates
    if (updates.scheduledTime && isNaN(new Date(updates.scheduledTime).getTime())) {
      throw new Error("Invalid date");
    }
    return await dynamoDBService.updatePublishingSchedule(scheduleId, updates);
  }

  /**
   * Suggest an optimal time for a user; naive implementation for now
   */
  async suggestOptimalTime(userId, platform) {
    // placeholder: simply schedule 24h from now at 10am user local time (naive)
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0, 0);
    return now.toISOString();
  }

  /**
   * Attach calendar event for an existing schedule
   */
  async addCalendarEvent(scheduleId, accessToken) {
    const schedule = await dynamoDBService.getPublishingScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const eventPayload = calendarService.buildEventFromSchedule(schedule);
    const event = await calendarService.createEvent(accessToken, eventPayload);

    // store event id back in schedule
    await dynamoDBService.updatePublishingSchedule(scheduleId, {
      calendarEventId: event.id,
    });

    return event;
  }

  /**
   * (Stub) Attempt to auto-post the content
   */
  async postNow(scheduleId) {
    // Implementation would call actual platform APIs
    const schedule = await dynamoDBService.getPublishingScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // for now just mark as posted with timestamp
    const updated = await dynamoDBService.updatePublishingSchedule(scheduleId, {
      status: "posted",
      postResult: {
        success: true,
        platformPostId: "", // would come from real API
        postedAt: new Date().toISOString(),
      },
    });

    return updated;
  }
}

export default new PublishingService();
