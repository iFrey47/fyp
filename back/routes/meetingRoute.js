import { Router } from "express";
import {
  scheduleMeeting,
  getAllMeetings,
  cancelMeeting,
  getStudentMeetings,
  getSupervisorMeetings,
} from "../controllers/meetingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Schedule a new meeting
router.post("/", authMiddleware, scheduleMeeting);

// Get all meetings
router.get("/", authMiddleware, getAllMeetings);

// Cancel a meeting
router.delete("/:id", authMiddleware, cancelMeeting);

router.get("/supervisor", authMiddleware, getSupervisorMeetings);
router.get("/student", authMiddleware, getStudentMeetings);

export default router;
