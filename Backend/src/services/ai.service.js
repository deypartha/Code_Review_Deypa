// Install the SDK first: npm install @google/generative-ai
const { GoogleGenerativeAI } = require("@google/generative-ai");


// initialize with your API key (must be set as env variable)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// pick the model
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `You are a helpful assistant. 
    You can provide a review for the given text.`
 });

async function generateContent(prompt){
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = generateContent;
