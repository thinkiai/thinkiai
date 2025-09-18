import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  const { message } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }]
    })
  });
  const result = await response.json();
  const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
  return NextResponse.json({ reply });
}