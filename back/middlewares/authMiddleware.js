import jwt from "jsonwebtoken";

const validateObjectId = (req, res, next) => {
  const id = req.params.id || req.params.ideaId;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// For the authorization
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ success: false, message: "Access denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export { authMiddleware, validateObjectId };
