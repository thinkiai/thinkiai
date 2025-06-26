
const API_KEY = "AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us";  // GEMINI API

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  messagesDiv.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
  inputField.value = "";

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { messages: [{ content: userMessage }] },
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content || "🤖 No reply";
    messagesDiv.innerHTML += `<div><strong>Thinki:</strong> ${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (err) {
    messagesDiv.innerHTML += `<div><strong>Thinki:</strong> ❌ Error retrieving response</div>`;
  }
}

function downloadChat() {
  const text = messagesDiv.innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ThinkiChat.txt";
  a.click();
}
