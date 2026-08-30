import express from "express";
import { authMiddleware } from "../../../middleware/authMiddleware.js";
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "./creatorProfile.controller.js";

const router = express.Router();

// Session-based Creator Profile routes (IDOR-safe endpoints utilizing req.userId)
router.get("/creator-profile", authMiddleware, getProfile);
router.post("/creator-profile", authMiddleware, createProfile);
router.put("/creator-profile", authMiddleware, updateProfile);
router.delete("/creator-profile", authMiddleware, deleteProfile);

export default router;
