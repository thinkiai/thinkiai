async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();
  if (!message) return;
  chatBox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  input.value = "";

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    });
    const data = await response.json();
    chatBox.innerHTML += `<div><strong>Thinki AI:</strong> ${data.text || "No reply"}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch {
    chatBox.innerHTML += `<div><strong>Thinki AI:</strong> Error retrieving response</div>`;
  }
}

function downloadChat() {
  const chat = document.getElementById("chat-box").innerText;
  const blob = new Blob([chat], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat.txt";
  link.click();
}
