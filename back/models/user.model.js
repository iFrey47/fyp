// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: ["student", "supervisor", "mentor", "admin", "coordinator"], // Define allowed roles
//       default: "student", // Default role
//     },
//     isAvailable: {
//       type: Boolean,
//       default: false,
//     },
//     supervisorId: {
//       type: mongoose.Schema.Types.ObjectId, // Stores the supervisor's _id
//       ref: "User", // References the User model
//       default: null, // Initially unassigned
//     },
//   },
//   { timestamps: true },
// );
// export default mongoose.model("User", userSchema);

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
      enum: ["student", "supervisor", "mentor", "admin", "coordinator"],
      default: "student",
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mentorDescription: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
