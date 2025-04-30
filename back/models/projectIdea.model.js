import mongoose from "mongoose";

const projectIdeaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    keywords: {
      // For advanced duplicate detection (optional)
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProjectIdea", projectIdeaSchema);
