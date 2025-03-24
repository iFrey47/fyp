import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

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
      { id: user._id, role: user.role },
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

// get use role

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
