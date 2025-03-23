import { Router } from "express";
// import { signUp, signIn } from "../controllers/authController";

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  deleteAccount,
  getProfile,
  signIn,
  updateProfile,
} from "../controllers/authController.js";
import { signUp } from "../controllers/authController.js";

const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);
router.delete("/delete-profile", authMiddleware, deleteAccount);

export default router;
