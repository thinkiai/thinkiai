import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate response" }import
async function sendMessage() {
  const input = document.getElementById('userInput').value;
  const responseDiv = document.getElementById('response');
  responseDiv.innerText = 'Loading...';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }) // Correctly send the user's message
    });
    
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();
    const reply = data.text || '🤖 No reply'; // Get the 'text' property from the response
    responseDiv.innerText = 'Thinki AI: ' + reply;
  } catch (err) {
    responseDiv.innerText = 'Error retrieving response';
  }
}

function downloadChat() {
  const response = document.getElementById('response').innerText;
  const blob = new Blob([response], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ThinkiAI_Chat.txt';
  a.click();
}
