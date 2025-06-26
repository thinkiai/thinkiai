
const GEMINI_API_KEY = "AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us";

async function sendMessage() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;
  const chatbox = document.getElementById("chatbox");
  chatbox.innerHTML += `<div><strong>You:</strong> ${input}</div>`;
  document.getElementById("userInput").value = "";

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { messages: [{ content: input }] },
        temperature: 0.9,
      })
    });
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content || "🤖 No reply";
    chatbox.innerHTML += `<div><strong>Thinki:</strong> ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
  } catch (error) {
    chatbox.innerHTML += `<div><strong>Thinki:</strong> 😢 Error: ${error.message}</div>`;
  }
}

function downloadChat() {
  const chat = document.getElementById("chatbox").innerText;
  const blob = new Blob([chat], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "thinki_chat.txt";
  a.click();
  URL.revokeObjectURL(url);
}
