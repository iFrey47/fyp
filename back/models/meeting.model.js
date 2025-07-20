import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    time: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    panelMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Meeting", meetingSchema);
