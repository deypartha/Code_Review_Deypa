const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Code Reviewer Application",
  }
});

const SYSTEM_INSTRUCTION = `You are an expert Senior Software Engineer and Code Reviewer. 
Your task is to review the user's source code thoroughly, constructively, and professionally.

Provide your feedback structured cleanly in Markdown using the following sections:

1. 📌 **Executive Summary**: Brief overview of the code quality, purpose, and key takeaways.
2. ⚠️ **Issues & Vulnerabilities**: Point out any bugs, logic flaws, anti-patterns, or security risks.
3. ⚡ **Performance & Optimization**: Suggest improvements for speed, memory usage, or readability.
4. ✨ **Refactored Code**: Provide the clean, fully improved code block with syntax highlighting and inline comments explaining key updates.

Maintain a polite, helpful, and highly professional tone. Keep explanations clear and actionable.`;

async function generateContent(prompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("API Key configuration missing. Please set OPENROUTER_API_KEY in environment variables.");
  }

  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter API call failed:", err);
    throw new Error(err.message || "Failed to generate code review via OpenRouter.");
  }
}

module.exports = generateContent;





