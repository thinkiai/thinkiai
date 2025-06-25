/**
 * Thinki AI Script by Kandi Chantilly © 2025
 * This script powers the Thinki AI chatbot using Gemini API.
 * Redistribution, reuse, or rehosting without permission is strictly prohibited.
 */

const apiKey = "YOUR_GEMINI_API_KEY"; // Replace this with your actual key

function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value;
  input.value = "";
  appendMessage("You", message);

  fetch("https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=" + apiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: { messages: [{ content: message, author: "user" }] }
    })
  })
    .then((res) => res.json())
    .then((data) => {
      const reply = data.candidates?.[0]?.content || "No reply.";
      appendMessage("Thinki AI", reply);
    })
    .catch((err) => appendMessage("Thinki AI", "Error: " + err.message));
}

function appendMessage(sender, message) {
  const chat = document.getElementById("chat-log");
  const div = document.createElement("div");
  div.textContent = `${sender}: ${message}`;
  chat.appendChild(div);
}

function downloadChat() {
  const text = document.getElementById("chat-log").innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat.txt";
  a.click();
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.onresult = function (event) {
    document.getElementById("user-input").value = event.results[0][0].transcript;
  };
  recognition.start();
}

function toggleTools() {
  const tools = document.getElementById("tools");
  tools.classList.toggle("hidden");
}
