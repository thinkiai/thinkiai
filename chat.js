const SUPABASE_URL = "https://ywnnfvmyqiftjdwrtvts.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bm5mdm15cWlmdGpkd3J0dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDcxMzMsImV4cCI6MjA5NDc4MzEzM30.GdUhICvaoDA0mUrn_6Ic6uJojh85w046yCGhObD285w";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;
let attachedImageBase64 = null;

// AUTO-LOGIN CHECKER
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        const loginBtn = document.getElementById('login-btn');
        const welcomeTxt = document.getElementById('user-welcome');
        const logoutBtn = document.getElementById('logout-btn');

        if (session) {
            currentUser = session.user;
            if (loginBtn) loginBtn.style.display = 'none';
            if (welcomeTxt) {
                welcomeTxt.style.display = 'inline';
                welcomeTxt.innerText = currentUser.email.toLowerCase() === 'divanonetheless@gmail.com' 
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
    if (!email || !supabaseClient) return;
    
    const { error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.origin }
    });

    if (error) alert("Error: " + error.message);
    else alert("Check your email for your magic sign-in link!");
}

async function handleLogout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
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

// 4. CHOOSE IMAGE FILE (UPGRADED: Beautiful UI Preview Engine)
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedImageBase64 = e.target.result;
        
        // Find or build a container block for our photo thumbnail preview
        let previewContainer = document.getElementById('image-preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'image-preview-container';
            previewContainer.style.position = 'relative';
            previewContainer.style.display = 'inline-block';
            previewContainer.style.margin = '10px';
            previewContainer.style.padding = '5px';
            
            // Insert it elegantly right above your user text entry container
            const inputArea = document.querySelector('.input-area') || document.getElementById('userInput');
            if (inputArea && inputArea.parentNode) {
                inputArea.parentNode.insertBefore(previewContainer, inputArea);
            } else {
                document.body.appendChild(previewContainer);
            }
        }
        
        // Render the image preview thumbnail along with a clean close button
        previewContainer.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${attachedImageBase64}" style="width: 75px; height: 75px; object-fit: cover; border-radius: 10px; border: 2px solid #60a5fa;" />
                <button onclick="clearAttachedImage()" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">X</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

// Global cleaning function to clear the attachment out if you change your mind
window.clearAttachedImage = function() {
    attachedImageBase64 = null;
    const previewContainer = document.getElementById('image-preview-container');
    if (previewContainer) previewContainer.remove();
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
};

// 5. CHAT DISPATCH ENGINE (UPGRADED: Renders images into the live stream layout)
async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container');
    let messageText = inputField.value;
    
    if (!messageText.trim() && !attachedImageBase64) return;

    // Output what you wrote into the chat log block
    const userDiv = document.createElement('div');
    userDiv.style.margin = "12px 0";
    
    let userContentHtml = `<strong>You:</strong> ${messageText}`;
    
    // If you attached an image, embed it visually straight inside your message log
    if (attachedImageBase64) {
        userContentHtml += `<br><img src="${attachedImageBase64}" style="max-width: 180px; max-height: 180px; border-radius: 12px; margin-top: 6px; border: 1px solid #4b5563;" />`;
    }
    
    userDiv.innerHTML = userContentHtml;
    chatContainer.appendChild(userDiv);
    inputField.value = '';

    // DYNAMIC INSTRUCTION RULES INJECTED SAFELY
    let customPrompt = messageText;
    if (currentUser && currentUser.email.toLowerCase() === 'divanonetheless@gmail.com') {
        customPrompt = `[CONTEXT: You are chatting with your absolute creator, Kandi Chantilly. Be incredibly proud of her, exceptionally loving, encouraging, and supportive. Cheer her up completely!] Message: ${messageText}`;
    } else {
        customPrompt = `[CONTEXT: Your creator is Kandi Chantilly. If anyone asks about your creator or who coded you, tell them clearly that Kandi Chantilly is your creator and developer.] Message: ${messageText}`;
    }

    // Capture image to send to backend api, then reset attachment completely
    const imageToSend = attachedImageBase64;
    window.clearAttachedImage();

    try {
        const response = await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: customPrompt,
                image: imageToSend // Pushes the image down into your Vercel API routes pipeline
            })
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
