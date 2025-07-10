async function sendMessage() {
  const input = document.getElementById('userInput').value;
  const responseDiv = document.getElementById('response');
  responseDiv.innerText = 'Loading...';

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_API_KEY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: input }] }]
      })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 No reply';
    responseDiv.innerText = 'Thinki AI: ' + reply;
  } catch (err) {
    responseDiv.innerText = 'Error retrieving response';
  }
}

function downloadChat() {
  const response = document.getElementById('response').innerText;
  const blob = new Blob([response], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ThinkiAI_Chat.txt';
  a.click();
}
