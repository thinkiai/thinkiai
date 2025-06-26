
const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage("You", text);
    userInput.value = "";

    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: text }] }]
        })
    })
    .then(res => res.json())
    .then(data => {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't catch that.";
        appendMessage("Thinki", reply);
    })
    .catch(() => appendMessage("Thinki", "Oops! Something went wrong."));
}

function appendMessage(sender, text) {
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function downloadChat() {
    const text = chatbox.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "thinki_chat.txt";
    link.click();
}

function showTools() {
    alert("🛠️ Tools coming soon...");
}
