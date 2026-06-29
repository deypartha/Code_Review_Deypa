const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const code = req.body.code;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: "Code snippet is required for review." });
    }
    const response = await aiService(code);
    res.status(200).send(response);
  } catch (error) {
    console.error("Error generating code review:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate review. Please check your server API key configuration." 
    });
  }
};