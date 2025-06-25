
const chatlog = document.getElementById('chatlog');

function sendMessage() {
    const input = document.getElementById('userInput');
    const userText = input.value.trim();
    if (!userText) return;
    addToChatLog('You', userText);
    input.value = '';

    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key= "AIzaSyBF_Ma25t3IQujh8IzwKANtPBftkCWV9Us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userText }] }]
        })
    })
    .then(res => res.json())
    .then(data => {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 Sorry, I didn't understand that.';
        addToChatLog('Thinki', reply);
    })
    .catch(err => {
        addToChatLog('Thinki', '⚠️ There was an error. Please try again.');
    });
}

function addToChatLog(sender, message) {
    const entry = document.createElement('div');
    entry.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatlog.appendChild(entry);
    chatlog.scrollTop = chatlog.scrollHeight;
}

function downloadChat() {
    const text = chatlog.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'thinki_chat.txt';
    link.click();
}
