import path from "path";
import { fileURLToPath } from "url";

import User from "../models/user.model.js";
import Document from "../models/documentModel.js";
import upload from "../utils/uploadMiddleware.js";

// ESM path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for single file upload
export const uploadFile = upload.single("document");

// Upload document handler
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const studentId = req.user.id;
  try {
    const student = await User.findById(studentId).select("supervisorId");

    if (!student || !student.supervisorId) {
      return res.status(400).json({
        success: false,
        message: "No supervisor assigned to this student",
      });
    }

    const document = await Document.create({
      studentId,
      supervisorId: student.supervisorId,
      filePath: req.file.path,
      originalName: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      document: {
        _id: document._id,
        originalName: document.originalName,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

// Serve a file by ID
export const getFile = async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const userId = req.user.id?.toString();

    if (
      userId !== document.studentId.toString() &&
      userId !== document.supervisorId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ success: false });
  }
};

// Get documents submitted by a student
export const getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ studentId: req.user.id });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching student documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student documents",
      error: error.message,
    });
  }
};

// Get documents for supervisor (optionally filtered by student)
export const getSupervisorDocuments = async (req, res) => {
  try {
    const query = { supervisorId: req.user.id };

    if (req.query.studentId) {
      query.studentId = req.query.studentId;
    }

    const documents = await Document.find(query).populate(
      "studentId",
      "username email",
    );

    console.log("Found Documents:", documents.length);

    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching supervisor docs:", error);
    res.status(500).json({ success: false });
  }
};

// Supervisor reviews a document
export const reviewDocument = async (req, res) => {
  const { docId } = req.params;
  const { status, feedback } = req.body;

  try {
    const document = await Document.findOneAndUpdate(
      { _id: docId, supervisorId: req.user.id },
      { status, feedback },
      { new: true },
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized",
      });
    }

    res.status(200).json({ success: true, document });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ success: false });
  }
};
