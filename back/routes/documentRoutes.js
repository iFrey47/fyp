import express from "express";
import { Router } from "express";
import {
  uploadFile,
  uploadDocument,
  getStudentDocuments,
  getSupervisorDocuments,
  reviewDocument,
  getFile,
} from "../controllers/documentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../utils/uploadMiddleware.js";
import multer from "multer";

const router = Router();

// router.post("/upload", authMiddleware, uploadFile, uploadDocument);
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("document")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadDocument,
);

router.get("/student", authMiddleware, getStudentDocuments);
router.get("/supervisor", authMiddleware, getSupervisorDocuments);
router.put("/:docId/review", authMiddleware, reviewDocument);
router.get("/:docId/file", authMiddleware, getFile);

export default router;
