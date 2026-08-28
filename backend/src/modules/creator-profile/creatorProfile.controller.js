import creatorProfileService, {
  ProfileAlreadyExistsError,
} from "./creatorProfile.service.js";
import { successResponse, errorResponse } from "../../../utils/response.js";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    const profile = await creatorProfileService.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json(errorResponse("ProfileNotFound", "Creator profile not found for this user"));
    }

    return res.status(200).json(successResponse(profile));
  } catch (error) {
    return next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    const profile = await creatorProfileService.createProfile(userId, req.body);
    return res.status(201).json(successResponse(profile, "Creator profile created successfully"));
  } catch (error) {
    if (error instanceof ProfileAlreadyExistsError) {
      return res.status(409).json(errorResponse("Conflict", error.message));
    }
    return res.status(400).json(errorResponse("ValidationError", error.message));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    const updated = await creatorProfileService.updateProfile(userId, req.body);
    return res.status(200).json(successResponse(updated, "Creator profile updated successfully"));
  } catch (error) {
    return res.status(400).json(errorResponse("ValidationError", error.message));
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    await creatorProfileService.deleteProfile(userId);
    return res.status(200).json(successResponse(null, "Creator profile deleted successfully"));
  } catch (error) {
    return res.status(400).json(errorResponse("DeletionError", error.message));
  }
};
