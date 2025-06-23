import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import { validateObjectId } from "../middlewares/authMiddleware.js";

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
  recommendIdeas,
} from "../controllers/projectIdeaController.js";
import {
  assignSupervisor,
  getAllStudentsForCoordinator,
  getAllSupervisors,
  getStudentsBySupervisor,
  getUnassignedStudents,
} from "../controllers/fetcherController.js";

const router = Router();

// Authentication and authorization
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);
router.delete("/delete-profile", authMiddleware, deleteAccount);

// Mentors and roles
router.get("/user-role", authMiddleware, getUserRole);
router.get("/mentors", authMiddleware, getAllMentors);
router.get("/availability", authMiddleware, getAvailability);
router.put("/toggle-availability", authMiddleware, toggleAvailability);

// Mentorship requests
router.post("/send-request", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, fetchRequests);
router.put("/request/:requestId", authMiddleware, updateRequestStatus);
router.get("/accepted-students", authMiddleware, fetchAcceptedStudents);

// Project Ideas
router.post("/checkID", authMiddleware, checkDuplicateIdea);
router.post("/submitID", authMiddleware, submitIdea);
router.get("/projects", authMiddleware, getAllProjects);
router.delete(
  "/delete-projects/:id",
  authMiddleware,
  validateObjectId,
  deleteIdea,
);

// NEW AI-Powered Recommendation Route
router.get(
  "/projects/recommend/:ideaId",
  authMiddleware,
  validateObjectId,
  recommendIdeas,
);

// fetchingController's routes

router.get("/students-unassigned", authMiddleware, getUnassignedStudents);
router.get("/supervisors", authMiddleware, getAllSupervisors);
router.post("/assign-supervisor", authMiddleware, assignSupervisor);
router.get("/students/all", authMiddleware, getAllStudentsForCoordinator);

router.get("/students/assigned-to-me", authMiddleware, getStudentsBySupervisor);

export default router;
