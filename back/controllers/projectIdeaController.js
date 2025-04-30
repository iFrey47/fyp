import ProjectIdea from "../models/projectIdea.model.js";
import stringSimilarity from "string-similarity";

// Normalize text for comparison
const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();

export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectIdea.find().populate(
      "submittedBy",
      "username"
    );
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const checkDuplicateIdea = async (req, res) => {
  const { title, description } = req.body;

  if (!req.body.title || !req.body.description) {
    return res.status(400).json({ error: "Title and description required" });
  }

  try {
    const allIdeas = await ProjectIdea.find().populate(
      "submittedBy",
      "username"
    );

    // Compare against existing ideas
    const similarIdeas = allIdeas.filter((idea) => {
      const titleSimilarity = stringSimilarity.compareTwoStrings(
        normalizeText(title),
        normalizeText(idea.title)
      );
      const descSimilarity = stringSimilarity.compareTwoStrings(
        normalizeText(description),
        normalizeText(idea.description)
      );
      return titleSimilarity > 0.7 || descSimilarity > 0.6; // Adjust thresholds
    });

    res.json({
      isDuplicate: similarIdeas.length > 0,
      matches: similarIdeas,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during duplicate check" });
  }
};

// Submit the ideas

// controllers/project.controller.js
export const submitIdea = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  try {
    // Check if user already submitted
    const existingSubmission = await ProjectIdea.findOne({
      submittedBy: userId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        error: "You've already submitted a project idea",
        existingIdea: existingSubmission,
      });
    }

    // Create new submission
    const newIdea = await ProjectIdea.create({
      title,
      description,
      submittedBy: userId,
      keywords: extractKeywords(`${title} ${description}`),
    });

    res.status(201).json({
      success: true,
      idea: newIdea,
    });
  } catch (err) {
    if (err.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({
        error: "You've already submitted a project idea",
      });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Helper: Extract keywords (using natural library)
const extractKeywords = (text) => {
  const tokens = text.toLowerCase().split(/\s+/);
  const stopwords = ["the", "a", "an", "using", "for"];
  return [
    ...new Set(
      tokens.filter((token) => !stopwords.includes(token) && token.length > 3)
    ),
  ];
};

// delete the idea
export const deleteIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);

    // Authorization check
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = idea.submittedBy.equals(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await ProjectIdea.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
