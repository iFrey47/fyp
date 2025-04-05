import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the student
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the mentor
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"], // Track request status
      default: "pending",
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
