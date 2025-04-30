import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  deleteAccount,
  fetchAcceptedStudents,
  fetchRequests,
  getAllMentors,
  getAvailability,
  getProfile,
  getUserRole,
  sendRequest,
  signIn,
  toggleAvailability,
  updateProfile,
  updateRequestStatus,
} from "../controllers/authController.js";
import { signUp } from "../controllers/authController.js";

import {
  checkDuplicateIdea,
  submitIdea,
  getAllProjects,
  deleteIdea,
} from "../controllers/projectIdeaController.js";

const router = Router();

//related to the authentication and authorization
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);
router.delete("/delete-profile", authMiddleware, deleteAccount);

//mentors and roles
router.get("/user-role", authMiddleware, getUserRole);
router.get("/mentors", authMiddleware, getAllMentors);
// Route to get availability status of a mentor
router.get("/availability", authMiddleware, getAvailability);

// Route to toggle availability status of a mentor
router.put("/toggle-availability", authMiddleware, toggleAvailability);

// send or accept request bw mentors and the studs
router.post("/send-request", authMiddleware, sendRequest);
// router.put("/request/:requestId", authMiddleware, acceptRequest);
router.get("/requests", authMiddleware, fetchRequests);
router.put("/request/:requestId", authMiddleware, updateRequestStatus);

router.get("/accepted-students", authMiddleware, fetchAcceptedStudents);

// Project Ideas shi

router.post("/checkID", authMiddleware, checkDuplicateIdea);

router.post("/submitID", authMiddleware, submitIdea);

router.get("/projects", authMiddleware, getAllProjects);

router.delete("/projects/:id", authMiddleware, deleteIdea);

export default router;
