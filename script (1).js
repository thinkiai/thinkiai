document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = input.value;
  input.value = "";
  chatBox.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userMessage }] }]
    })
  });

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, I’m thinking...";
  chatBox.innerHTML += `<div><strong>Thinki:</strong> ${reply}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});