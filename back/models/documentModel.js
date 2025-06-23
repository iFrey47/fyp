import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Document", documentSchema);
