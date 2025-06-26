
const API_KEY = "AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us";
const chatBox = document.getElementById('chat-box');

async function sendMessage() {
    const input = document.getElementById('user-input').value;
    appendMessage("You", input);

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=" + API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: { messages: [{ content: input }] }
            })
        });

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content || "Sorry, I didn’t get that.";
        appendMessage("Thinki AI", reply);
    } catch (error) {
        appendMessage("Thinki AI", "No reply");
    }
}

function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function startVoice() {
    alert("Voice input coming soon!");
}

function downloadChat() {
    const chat = chatBox.innerText;
    const blob = new Blob([chat], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ThinkiAI_Chat.txt";
    link.click();
}
