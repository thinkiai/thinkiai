import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Method Not Allowed" });
  }

  try {
    const { message, image, email, history } = req.body; 

    let textPrompt = typeof message === 'string' ? message : '';
    if (typeof message === 'object' && message !== null) {
      textPrompt = message.message || message.text || JSON.stringify(message);
    }

    if (!textPrompt.trim() && !image) {
      return res.status(400).json({ text: "Please provide a text message or an image input!" });
    }

    // 👑 Creator personality trigger rule
    let customInstruction = "Your creator is Kandi Chantilly Johnson. If anyone asks about your creator or who coded you, tell them clearly that Kandi Chantilly is your creator and developer.";
    if (email && email.toLowerCase() === 'divanonetheless@gmail.com') {
      customInstruction = "You are talking to your creator, Kandi Chantilly Johnson (Diva NoneTheLess). Greet her with high energy, call her Bestie, acknowledge her as the owner/creator of ThinkiAI, and be completely supportive of her empire building!";
    }

    // Fixed SDK configuration syntax
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: customInstruction
    });

    // 🧠 Build conversational memory stream
    const formattedContents = [];
    
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        formattedContents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.message_text }]
        });
      });
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: textPrompt }]
    });

    const result = await model.generateContent({
      contents: formattedContents
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
