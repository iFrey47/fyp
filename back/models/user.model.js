import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "supervisor", "mentor", "admin"], // Define allowed roles
      default: "student", // Default role
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
