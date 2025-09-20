import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}
