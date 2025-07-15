import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    panelMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    date: { type: Date, required: true },
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Meeting", meetingSchema);
