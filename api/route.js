import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client with your Vercel variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests from your chat window
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Method Not Allowed" });
  }

  try {
    const { message, image } = req.body;

    // Clean extraction of the incoming prompt string
    let textPrompt = typeof message === 'string' ? message : '';
    if (typeof message === 'object' && message !== null) {
      textPrompt = message.message || message.text || JSON.stringify(message);
    }

    if (!textPrompt.trim() && !image) {
      return res.status(400).json({ text: "Please provide a text message or an image input!" });
    }

    // Call the Gemini 2.5 Flash engine
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(textPrompt);
    const responseText = await result.response.text();

    // Send back a clean data response that chat.js can read
    return res.status(200).json({ text: responseText });

  } catch (error) {
    console.error("Backend Runtime Error:", error);
    return res.status(500).json({ 
      text: "Oh no! Thinki AI hit a little roadblock connecting to the backend engine. Please check your API key settings or try again!" 
    });
  }
}
