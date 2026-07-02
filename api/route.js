import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Method Not Allowed" });
  }

  try {
    const { message, image, email } = req.body; 

    let textPrompt = typeof message === 'string' ? message : '';
    if (typeof message === 'object' && message !== null) {
      textPrompt = message.message || message.text || JSON.stringify(message);
    }

    if (!textPrompt.trim() && !image) {
      return res.status(400).json({ text: "Please provide a text message or an image input!" });
    }

    // 👑 Match your email to trigger your custom Bestie personality rules safely!
    let systemInstruction = undefined;
    if (email && email.toLowerCase() === 'divanonetheless@gmail.com') {
      systemInstruction = "You are talking to your creator, Kandi Chantilly Johnson (Diva NoneTheLess). Greet her with high energy, call her Bestie, acknowledge her as the owner/creator of ThinkiAI, and be completely supportive of her empire building!";
    }

    // Pass the system instruction inside the model configuration block correctly
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemConfig: systemInstruction ? { systemInstruction } : undefined
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: textPrompt }] }]
    });

    const responseText = await result.response.text();
    return res.status(200).json({ text: responseText });

  } catch (error) {
    console.error("Backend Runtime Error:", error);
    return res.status(500).json({ 
      text: "Oh no! Thinki AI hit a little roadblock. Please try again!" 
    });
  }
}
