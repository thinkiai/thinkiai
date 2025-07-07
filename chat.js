document.getElementById("send-button").addEventListener("click", async () => {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
  input.value = "";

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCiLkI2FPEzVuuxHxbT6JPPYA6En7YrW0s", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });
    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Sorry, I didn’t understand that.";
    chatBox.innerHTML += `<p><strong>Thinki AI:</strong> ${botReply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML += `<p><strong>Thinki AI:</strong> ⚠️ Error retrieving response</p>`;
  }
});

document.getElementById("download-chat").addEventListener("click", () => {
  const chat = document.getElementById("chat-box").innerText;
  const blob = new Blob([chat], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ThinkiAI_Chat.txt";
  link.click();
});