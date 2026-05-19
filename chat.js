// 1. DATABASE SETUP (Get these two from Supabase.com)
const SUPABASE_URL = "https://your-project-id.supabase.co"; 
const SUPABASE_ANON_KEY = "your-actual-anon-key-here";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;
let attachedImageBase64 = null;

// AUTO-LOGIN CHECKER
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        const loginBtn = document.getElementById('login-btn');
        const welcomeTxt = document.getElementById('user-welcome');
        const logoutBtn = document.getElementById('logout-btn');

        if (session) {
            currentUser = session.user;
            if (loginBtn) loginBtn.style.display = 'none';
            if (welcomeTxt) {
                welcomeTxt.style.display = 'inline';
                welcomeTxt.innerText = currentUser.email.toLowerCase() === 'kandichantilly@gmail.com' 
                    ? "Welcome, Creator 👑" 
                    : `Hi, ${currentUser.email.split('@')[0]}`;
            }
            if (logoutBtn) logoutBtn.style.display = 'inline';
        } else {
            currentUser = null;
            if (loginBtn) loginBtn.style.display = 'inline';
            if (welcomeTxt) welcomeTxt.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    });
}

async function handleLogin() {
    const email = prompt("Enter your email address to sign in:");
    if (!email || !supabase) return;
    
    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.origin }
    });

    if (error) alert("Error: " + error.message);
    else alert("Check your email for your magic sign-in link!");
}

async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
}

// 2. MICROPHONE ACTIVATION
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Browser voice tracking not supported. Use Google Chrome.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const inputField = document.getElementById('userInput');
        if (inputField) inputField.value = transcript;
    };
}

// 3. DOWNLOAD HISTORY FILE
function downloadChatHistory() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer || !chatContainer.innerText.trim()) {
        alert("No text to download yet!");
        return;
    }
    const blob = new Blob([chatContainer.innerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThinkiAI_Log_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 4. CHOOSE IMAGE FILE
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedImageBase64 = e.target.result;
        alert(`File selected: ${file.name}`);
    };
    reader.readAsDataURL(file);
}

// 5. CHAT DISPATCH ENGINE
async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container');
    let messageText = inputField.value;
    
    if (!messageText.trim()) return;

    // Output what you wrote into the chat log block
    const userDiv = document.createElement('div');
    userDiv.innerHTML = `<strong>You:</strong> ${messageText}`;
    userDiv.style.margin = "8px 0";
    chatContainer.appendChild(userDiv);
    inputField.value = '';

    // DYNAMIC INSTRUCTION RULES INJECTED SAFELY
    let customPrompt = messageText;
    if (currentUser && currentUser.email.toLowerCase() === 'kandichantilly@gmail.com') {
        customPrompt = `[CONTEXT: You are chatting with your absolute creator, Kandi Chantilly. Be incredibly proud of her, exceptionally loving, encouraging, and supportive. Cheer her up completely!] Message: ${messageText}`;
    } else {
        customPrompt = `[CONTEXT: Your creator is Kandi Chantilly. If anyone asks about your creator or who coded you, tell them clearly that Kandi Chantilly is your creator and developer.] Message: ${messageText}`;
    }

    try {
        const response = await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: customPrompt })
        });
        
        const data = await response.json();
        
        // Output Thinki AI's word responses
        const aiDiv = document.createElement('div');
        aiDiv.innerHTML = `<strong>Thinki AI:</strong> ${data.text}`;
        aiDiv.style.color = "#60a5fa";
        aiDiv.style.margin = "8px 0";
        chatContainer.appendChild(aiDiv);
        
        // Auto scroll chat down
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
        console.error(err);
        alert("Couldn't reach Thinki AI.");
    }
}
