const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");

const apiKey = "AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us"; // Gemini Pro API Key

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  userInput.value = "";

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        }),
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no reply.";
    chatBox.innerHTML += `<p><strong>Thinki AI:</strong> ${reply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    chatBox.innerHTML += `<p><strong>Thinki AI:</strong> Error retrieving response</p>`;
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});