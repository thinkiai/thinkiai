import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the incoming standard JSON body
    const body = await request.json();
    const { message, image } = body;

    // Ensure we extract a clean string from the message payload
    let textPrompt = typeof message === 'string' ? message : '';
    if (typeof message === 'object' && message !== null) {
      textPrompt = message.message || message.text || JSON.stringify(message);
    }

    if (!textPrompt.trim() && !image) {
      return new Response(
        JSON.stringify({ text: "Please provide a text message or an image input!" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the modern Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(textPrompt);
    const responseText = await result.response.text();

    // Return a clean, standardized Web Response
    return new Response(
      JSON.stringify({ text: responseText }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ text: "Oh no! Thinki AI hit a little roadblock connecting to the backend engine. Please check your API key settings or try again!" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
