async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
    document.getElementById("user-input").value = "";

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    const reply = data.reply || "🤖 Sorry, I didn't understand that.";
    chatBox.innerHTML += `<div><strong>Thinki:</strong> ${reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function downloadChat() {
    const chatContent = document.getElementById("chat-box").innerText;
    const blob = new Blob([chatContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat.txt";
    a.click();
}