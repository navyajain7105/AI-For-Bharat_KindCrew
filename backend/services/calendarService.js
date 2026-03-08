
import { google } from "googleapis";

/**
 * CalendarService
 * Handles Google Calendar API interactions such as creating events
 */

class CalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "📅 Google Calendar credentials not configured (GOOGLE_CLIENT_ID / SECRET)",
      );
    }
  }

  getOAuthClient() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri || "",
    );
  }

  /**
   * Create a calendar event using an OAuth access token
   * @param {string} accessToken
   * @param {Object} eventData  // expect {summary, description, start, end}
   * @returns {Promise<Object>} calendar event data
   */
  async createEvent(accessToken, eventData) {
    const auth = this.getOAuthClient();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        reminders: eventData.reminders || { useDefault: true },
      },
    });

    return res.data;
  }

  /**
   * Build a simple event payload from a schedule object
   */
  buildEventFromSchedule(schedule) {
    const start = {
      dateTime: new Date(schedule.scheduledTime).toISOString(),
    };
    const end = {
      // default to one hour slot
      dateTime: new Date(
        new Date(schedule.scheduledTime).getTime() + 60 * 60 * 1000,
      ).toISOString(),
    };

    return {
      summary: schedule.formattedContent?.title || "Scheduled Post",
      description: schedule.formattedContent?.caption || "",
      start,
      end,
    };
  }
}

export default new CalendarService();
