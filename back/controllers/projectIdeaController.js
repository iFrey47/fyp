import ProjectIdea from "../models/projectIdea.model.js";
import natural from "natural";
const { TfIdf, PorterStemmer } = natural;

import stringSimilarity from "string-similarity";

// Normalize text for comparison
const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();

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

const preprocessText = (text) => {
  return PorterStemmer.stem(text.toLowerCase().replace(/[^\w\s]/g, "")).trim();
};

// Cosine similarity function - looks good
// formula= (A · B) / (||A|| * ||B||)
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dotProduct / (magA * magB) : 0;
};

// TF-IDF model builder - could be cached
const buildTfIdfModel = async () => {
  const tfidf = new TfIdf();
  const allIdeas = await ProjectIdea.find();

  allIdeas.forEach((idea, idx) => {
    tfidf.addDocument(preprocessText(`${idea.title} ${idea.description}`));
  });

  return { tfidf, allIdeas };
};

// Fixed duplicate checker function
export const checkDuplicateIdeaMax = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description required" });
  }

  try {
    const { tfidf, allIdeas } = await buildTfIdfModel();
    const inputText = preprocessText(`${title} ${description}`);

    // Vectorize input
    const inputVector = [];
    tfidf.tfidfs(inputText, (i, measure) => {
      inputVector[i] = measure;
    });

    // Find similar ideas
    const similarityThreshold = 0.8; // Reduced threshold for better detection
    const similarityResults = [];

    allIdeas.forEach((idea, index) => {
      const ideaText = preprocessText(`${idea.title} ${idea.description}`);
      const ideaVector = [];

      tfidf.tfidfs(ideaText, (i, measure) => {
        ideaVector[i] = measure;
      });

      const similarity = cosineSimilarity(inputVector, ideaVector);

      if (similarity > similarityThreshold) {
        similarityResults.push({
          _id: idea._id,
          title: idea.title,
          similarity: similarity,
        });
      }
    });

    // Log for debugging
    console.log(`Found ${similarityResults.length} potential duplicates`);

    res.json({
      isDuplicate: similarityResults.length > 0,
      matches: similarityResults,
    });
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ error: "AI duplicate check failed" });
  }
};

// AI Recommendations
export const recommendIdeas = async (req, res) => {
  const { ideaId } = req.params;

  try {
    const targetIdea = await ProjectIdea.findById(ideaId);
    if (!targetIdea) return res.status(404).json({ error: "Idea not found" });

    const { tfidf, allIdeas } = await buildTfIdfModel();
    const targetText = preprocessText(
      `${targetIdea.title} ${targetIdea.description}`
    );

    // Vectorize target idea
    const targetVector = [];
    tfidf.tfidfs(targetText, (i, measure) => {
      targetVector[i] = measure;
    });

    // Get recommendations (excluding current idea)
    const recommendations = allIdeas
      .filter((idea) => !idea._id.equals(ideaId))
      .map((idea) => {
        const ideaText = preprocessText(`${idea.title} ${idea.description}`);
        const ideaVector = [];
        tfidf.tfidfs(ideaText, (i, measure) => {
          ideaVector[i] = measure;
        });
        return {
          ...idea.toObject(),
          similarity: cosineSimilarity(targetVector, ideaVector),
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Top 3 recommendations

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: "AI recommendation failed" });
  }
};

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

export const submitIdeaMax = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  try {
    // 1. First check for duplicates using TF-IDF
    const { tfidf, allIdeas } = await buildTfIdfModel();
    const inputText = preprocessText(`${title} ${description}`);

    const inputVector = [];
    tfidf.tfidfs(inputText, (i, measure) => {
      inputVector[i] = measure;
    });

    // Check for similar existing ideas
    const similarIdeas = allIdeas.filter((idea) => {
      const ideaText = preprocessText(`${idea.title} ${idea.description}`);
      const ideaVector = [];
      tfidf.tfidfs(ideaText, (i, measure) => {
        ideaVector[i] = measure;
      });
      return cosineSimilarity(inputVector, ideaVector) > 0.95; // Strict threshold for submission
    });

    if (similarIdeas.length > 0) {
      return res.status(400).json({
        error: "This project idea is too similar to existing ideas",
        matches: similarIdeas.map((idea) => ({
          _id: idea._id,
          title: idea.title,
          similarity: cosineSimilarity(inputVector, ideaVector),
        })),
      });
    }

    // 2. Check if user already submitted
    const existingSubmission = await ProjectIdea.findOne({
      submittedBy: userId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        error: "You've already submitted a project idea",
        existingIdea: existingSubmission,
      });
    }

    // 3. Create new submission
    const newIdea = await ProjectIdea.create({
      title,
      description,
      submittedBy: userId,
      keywords: extractKeywords(`${title} ${description}`),
    });

    res.status(201).json({ success: true, idea: newIdea });
  } catch (err) {
    console.error("Submission error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate submission detected" });
    }
    res.status(500).json({ error: "Server error during submission" });
  }
};
// Enhanced keyword extraction
const extractKeywordsMax = (text) => {
  const tokens = preprocessText(text).split(/\s+/);
  const stopwords = new Set(["the", "a", "an", "using", "for", "with", "this"]);
  return [
    ...new Set(
      tokens.filter((token) => !stopwords.has(token) && token.length > 3)
    ),
  ].slice(0, 5); // Limit to 5 keywords
};

export const deleteIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });

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
