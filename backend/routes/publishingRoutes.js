
import express from "express";
import {
  scheduleContent,
  listSchedules,
  updateSchedule,
  postNow,
  formatContent,
  addCalendarEvent,
} from "../controllers/publishingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All publishing routes require authentication for now
router.post("/publishing/schedule", authMiddleware, scheduleContent);
router.get("/publishing/scheduled", authMiddleware, listSchedules);
router.put("/publishing/:id", authMiddleware, updateSchedule);
router.post("/publishing/:id/post", authMiddleware, postNow);
router.get("/publishing/:id/format/:platform", authMiddleware, formatContent);
router.post("/publishing/:id/calendar", authMiddleware, addCalendarEvent);

export default router;
