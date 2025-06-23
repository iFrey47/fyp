import express from "express";
import User from "../models/user.model.js";
// Fetch all students without supervisors (for assignment)
export const getUnassignedStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      supervisorId: { $exists: false }, // Only students not yet assigned
    }).select("-password");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all supervisors
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" }).select(
      "-password",
    );
    res.status(200).json({
      success: true,
      supervisors,
    });
  } catch (error) {
    console.error("Get Supervisors Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Assign supervisor to student
export const assignSupervisor = async (req, res) => {
  const { studentId, supervisorId } = req.body;

  if (!studentId || !supervisorId) {
    return res.status(400).json({
      success: false,
      message: "Student ID and Supervisor ID required",
    });
  }

  try {
    // Check if student exists and isn't already assigned
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    if (student.supervisorId) {
      return res.status(400).json({
        success: false,
        message: "Student is already assigned to a supervisor",
      });
    }

    // Check if supervisor exists
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    // Update assignment
    student.supervisorId = supervisorId;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      student: {
        _id: student._id,
        username: student.username,
        supervisorId: student.supervisorId,
      },
    });
  } catch (error) {
    console.error("Assignment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllStudentsForCoordinator = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("supervisorId", "username email"); // Populate supervisor details

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStudentsBySupervisor = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const students = await User.find({
      role: "student",
      supervisorId: supervisorId,
    }).select("-password");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
