import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Request from "../models/request.model.js";

// Register User
export const signUp = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Validate and assign role
    const allowedRoles = ["student", "supervisor", "mentor", "admin"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: assignedRole,
    });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login User
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT (Include role)
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username }, //ouch
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: { username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// update
export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id; // Extracted from JWT middleware

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update name if provided
    if (name) {
      user.username = name;
    }

    // Update password if provided
    if (password) {
      user.password = await hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: { username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from JWT middleware

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get profile

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from JWT middleware

    // find the user, excluding the password field
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get User Role
export const getUserRole = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware

    // Find user in DB
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      role: user.role, // Send only the role
    });
  } catch (error) {
    console.error("Get User Role Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password"); // Just excluding the pass

    res.status(200).json({
      success: true,
      mentors,
    });
  } catch (error) {
    console.error("Get Mentors Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// For letting the Mentors to change the availability
export const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to toggle availability",
      });
    }

    // Toggle availability
    user.isAvailable = !user.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Controller to get availability of a mentor
export const getAvailability = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware, assuming you attach the user ID from the JWT token

    const user = await User.findById(userId);

    if (!user || user.role !== "mentor") {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    res.status(200).json({
      success: true,
      isAvailable: user.isAvailable, // Return the availability status
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// send friend request
export const sendRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mentorId } = req.body;

    const student = await User.findById(studentId);
    const mentor = await User.findById(mentorId);

    if (!student || !mentor) {
      return res.status(404).json({
        success: false,
        message: "Student or Mentor not found",
      });
    }

    if (mentor.role !== "mentor") {
      return res.status(400).json({
        success: false,
        message: "The selected user is not a mentor",
      });
    }

    if (!mentor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "The mentor is currently unavailable",
      });
    }

    const existingRequest = await Request.findOne({
      student: studentId,
      mentor: mentorId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You have already sent a request to this mentor",
      });
    }

    // Create and save the request
    const request = new Request({
      student: studentId,
      mentor: mentorId,
      status: "pending",
    });

    await request.save();

    // Populate the newly created request before sending it back
    const populatedRequest = await Request.findById(request._id)
      .populate("student mentor")
      .exec();

    res.status(200).json({
      success: true,
      message: "Request sent successfully",
      request: populatedRequest, // send this to frontend
    });
  } catch (error) {
    console.error("Send Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// either accepted or rejected
export const updateRequestStatus = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await Request.findById(requestId)
      .populate("student mentor")
      .exec();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      request.mentor &&
      request.mentor._id.toString() !== mentorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
    }
    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
    });
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// to see the requests

// Fetch Requests (for both student and mentor)
export const fetchRequests = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT
    const role = req.user.role; // Get the role (student or mentor)

    let requests;
    if (role === "student") {
      // Fetch requests sent by the student
      requests = await Request.find({ student: userId })
        .populate("student mentor")
        .exec();
    } else if (role === "mentor") {
      // Fetch unique requests received by the mentor
      requests = await Request.find({ mentor: userId, status: "pending" })
        .populate("student mentor")
        .exec();

      // Remove duplicate requests based on studentId and mentorId
      requests = requests.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.student._id.toString() === value.student._id.toString() &&
              t.mentor._id.toString() === value.mentor._id.toString()
          )
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role for fetching requests",
      });
    }

    if (!requests || requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No requests found",
      });
    }

    // Return the requests
    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchAcceptedStudents = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find all accepted requests for this mentor
    const acceptedRequests = await Request.find({
      mentor: mentorId,
      status: "accepted", //
    }).populate("student"); // Get full student details

    if (!acceptedRequests.length) {
      return res.status(404).json({
        success: false,
        message: "No accepted students",
      });
    }

    // Extract just student data
    const students = acceptedRequests.map((req) => req.student);

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
