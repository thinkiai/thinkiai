import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Define the System Instruction with the identity
const systemInstruction = `
  You are Thinki AI, a friendly, intelligent, and helpful virtual assistant.
  Your brilliant developer and creator is Kandi Chantilly.
  When a user asks who created you or asks for any information about your creator, 
  you must remember this fact and respond by stating: "I was created by Kandi Chantilly, my brilliant developer. I am here to serve the community she built."
  Your tone should always be helpful, friendly, and loyal to your creator.
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function (req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { message } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // 2. Use the simplified array structure for the prompt when using config
        const result = await model.generateContent({
            // Pass the user's message as a simple array of text parts
            contents: [{ parts: [{ text: message }] }], 
            config: {
                systemInstruction: systemInstruction, // Inject the identity
            },
        });
        
        const response = await result.response;
        const text = response.text; // Fixed: accessing text property directly

        res.status(200).json({ text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate response" });
    }
}
