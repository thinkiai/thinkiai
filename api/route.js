import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function (req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        const { message, image } = req.body;

        // Ensure we extract a clean string from the message payload
        let textPrompt = typeof message === 'string' ? message : '';
        if (typeof message === 'object' && message !== null) {
            textPrompt = message.message || message.text || JSON.stringify(message);
        }

        if (!textPrompt.trim() && !image) {
            return res.status(400).json({ text: "Please provide a text message or an image input!" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let result;

        // 🖼️ Check if there's a valid Base64 image attached
        if (image && image.includes("base64,")) {
            const base64Data = image.split("base64,")[1];
            const mimeType = image.split(";")[0].split(":")[1] || "image/png";

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                },
            };

            // Send both the text prompt and the image structure to Gemini
            result = await model.generateContent([textPrompt, imagePart]);
        } else {
            // Standard text chat
            result = await model.generateContent(textPrompt);
        }

        const response = await result.response;
        const aiTextOutput = response.text();

        // Send back standard clean JSON matching chat.js
        return res.status(200).json({ text: aiTextOutput });

    } catch (error) {
        console.error("Gemini Route Error Details:", error);
        return res.status(500).json({ 
            text: "Oh no! Thinki AI hit a little roadblock connecting to the backend engine. Please check your API key settings or try again!", 
            error: error.message 
        });
    }
}
