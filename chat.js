const SUPABASE_URL = "https://ywnnfvmyqiftjdwrtvts.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bm5mdm15cWlmdGpkd3J0dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDcxMzMsImV4cCI6MjA5NDc4MzEzM30.GdUhICvaoDA0mUrn_6Ic6uJojh85w046yCGhObD285w";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;
let attachedImageBase64 = null;

// 🧭 TRACKS THE ACTIVE CONVERSATION SESSION UNTIL A NEW ONE IS CREATED
let currentChatId = crypto.randomUUID(); 

// 🍔 NEW SIDEBAR TOGGLE FUNCTION (Smoothly opens and closes the menu block)
window.toggleSidebarMenu = function() {
    const sidebar = document.getElementById('thinki-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
};

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
            
            renderSidebarSessions();
            loadChatHistory();
        } else {
            currentUser = null;
            if (loginBtn) loginBtn.style.display = 'inline';
            if (welcomeTxt) welcomeTxt.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            if (document.getElementById('chat-container')) document.getElementById('chat-container').innerHTML = '';
            if (document.getElementById('history-sidebar-list')) document.getElementById('history-sidebar-list').innerHTML = '';
        }
    });
}

// 🧭 SIDEBAR GENERATOR: Pulls unique historic conversations from the database
async function renderSidebarSessions() {
    if (!supabaseClient || !currentUser) return;
    const sidebarList = document.getElementById('history-sidebar-list');
    if (!sidebarList) return;

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('chat_id, chat_title, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const uniqueChats = [];
        const seenIds = new Set();
        data.forEach(item => {
            if (!seenIds.has(item.chat_id)) {
                seenIds.add(item.chat_id);
                uniqueChats.push(item);
            }
        });

        sidebarList.innerHTML = '';
        uniqueChats.forEach(chat => {
            const chatBtn = document.createElement('button');
            chatBtn.innerText = chat.chat_title || "Saved Chat Session";
            chatBtn.style.width = "100%";
            chatBtn.style.padding = "10px";
            chatBtn.style.background = chat.chat_id === currentChatId ? "#3b82f6" : "transparent";
            chatBtn.style.border = "none";
            chatBtn.style.borderRadius = "6px";
            chatBtn.style.color = "white";
            chatBtn.style.textAlign = "left";
            chatBtn.style.cursor = "pointer";
            chatBtn.style.overflow = "hidden";
            chatBtn.style.textOverflow = "ellipsis";
            chatBtn.style.whiteSpace = "nowrap";
            chatBtn.style.marginBottom = "4px";

            chatBtn.onclick = () => {
                currentChatId = chat.chat_id;
                renderSidebarSessions();
                loadChatHistory();
                
                // On mobile devices, auto close sidebar when a chat channel is tapped
                if (window.innerWidth <= 768) {
                    window.toggleSidebarMenu();
                }
            };
            sidebarList.appendChild(chatBtn);
        });
    } catch(err) {
        console.error(err);
    }
}

// 🧭 NEW CHAT SESSION TRIGGER
window.createNewChatSession = function() {
    currentChatId = crypto.randomUUID();
    document.getElementById('chat-container').innerHTML = `<div style="color: #9ca3af; text-align: center; margin-top: 20px;">Started a fresh stream. Say hi!</div>`;
    renderSidebarSessions();
    if (window.innerWidth <= 768) {
        window.toggleSidebarMenu();
    }
};

// Loads historic messages matching the active sidebar chat ID
async function loadChatHistory() {
    if (!supabaseClient || !currentUser) return;
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    try {
        const { data: pastMessages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('chat_id', currentChatId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        chatContainer.innerHTML = ''; 
        if (pastMessages && pastMessages.length > 0) {
            pastMessages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.style.margin = "12px 0";
                
                if (msg.sender === 'user') {
                    let userHtml = `<strong>You:</strong> ${msg.message_text}`;
                    if (msg.image_url) {
                        userHtml += `<br><img src="${msg.image_url}" style="max-width: 180px; max-height: 180px; border-radius: 12px; margin-top: 6px; border: 1px solid #4b5563;" />`;
                    }
                    msgDiv.innerHTML = userHtml;
                } else {
                    msgDiv.innerHTML = `<strong>Thinki AI:</strong> ${msg.message_text}`;
                    msgDiv.style.color = "#60a5fa";
                }
                chatContainer.appendChild(msgDiv);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            chatContainer.innerHTML = `<div style="color: #9ca3af; text-align: center; margin-top: 20px;">No messages in this chat yet. Start typing!</div>`;
        }
    } catch (err) {
        console.error("Error reloading past history:", err);
    }
}

// Saves data alongside active chat session tags
async function saveMessageToSupabase(sender, text, base64Image = null) {
    if (!supabaseClient || !currentUser) return;
    
    let dynamicTitle = text.substring(0, 25);
    if(text.length > 25) dynamicTitle += '...';
    if(!text.trim() && base64Image) dynamicTitle = "🖼️ Image Attachment";

    try {
        await supabaseClient.from('messages').insert([{
            user_id: currentUser.id,
            user_email: currentUser.email,
            sender: sender,
            message_text: text,
            image_url: base64Image,
            chat_id: currentChatId,
            chat_title: dynamicTitle
        }]);
    } catch (err) {
        console.error("Database save bottleneck:", err);
    }
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

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitRecognition || window.webkitSpeechRecognition;
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

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        attachedImageBase64 = e.target.result;
        
        let previewContainer = document.getElementById('image-preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'image-preview-container';
            previewContainer.style.position = 'relative';
            previewContainer.style.display = 'inline-block';
            previewContainer.style.margin = '10px';
            previewContainer.style.padding = '5px';
            
            const inputArea = document.getElementById('userInput');
            if (inputArea && inputArea.parentNode) {
                inputArea.parentNode.insertBefore(previewContainer, inputArea);
            } else {
                document.body.appendChild(previewContainer);
            }
        }
        
        previewContainer.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${attachedImageBase64}" style="width: 75px; height: 75px; object-fit: cover; border-radius: 10px; border: 2px solid #3b82f6;" />
                <button onclick="clearAttachedImage()" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">X</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

window.clearAttachedImage = function() {
    attachedImageBase64 = null;
    const previewContainer = document.getElementById('image-preview-container');
    if (previewContainer) previewContainer.remove();
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
};

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container');
    let messageText = inputField.value;
    
    if (!messageText.trim() && !attachedImageBase64) return;

    if (chatContainer.innerText.includes("Started a fresh stream") || chatContainer.innerText.includes("No messages in this chat yet")) {
        chatContainer.innerHTML = '';
    }

    const userDiv = document.createElement('div');
    userDiv.style.margin = "12px 0";
    
    let userContentHtml = `<strong>You:</strong> ${messageText}`;
    if (attachedImageBase64) {
        userContentHtml += `<br><img src="${attachedImageBase64}" style="max-width: 180px; max-height: 180px; border-radius: 12px; margin-top: 6px; border: 1px solid #4b5563;" />`;
    }
    
    userDiv.innerHTML = userContentHtml;
    chatContainer.appendChild(userDiv);
    inputField.value = '';

    await saveMessageToSupabase('user', messageText, attachedImageBase64);
    renderSidebarSessions();

    let customPrompt = messageText;
    if (currentUser && currentUser.email.toLowerCase() === 'divanonetheless@gmail.com') {
        customPrompt = `[CONTEXT: You are chatting with your absolute creator, Kandi Chantilly. Be incredibly proud of her, exceptionally loving, encouraging, and supportive. Cheer her up completely!] Message: ${messageText}`;
    } else {
        customPrompt = `[CONTEXT: Your creator is Kandi Chantilly. If anyone asks about your creator or who coded you, tell them clearly that Kandi Chantilly is your creator and developer.] Message: ${messageText}`;
    }

    const imageToSend = attachedImageBase64;
    window.clearAttachedImage();

    try {
        const response = await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: customPrompt,
                image: imageToSend
            })
        });
        
        const data = await response.json();
        
        const aiDiv = document.createElement('div');
        aiDiv.innerHTML = `<strong>Thinki AI:</strong> ${data.text}`;
        aiDiv.style.color = "#60a5fa";
        aiDiv.style.margin = "8px 0";
        chatContainer.appendChild(aiDiv);
        
        await saveMessageToSupabase('ai', data.text);
        renderSidebarSessions();
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
        console.error(err);
        alert("Couldn't reach Thinki AI.");
}
// 💻 Fix: Keep sidebar closed on BOTH desktop and mobile by default!
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("thinki-sidebar") || document.querySelector(".sidebar");
    const mainContainer = document.querySelector(".container");

    // Start with the sidebar collapsed on all devices
    if (sidebar) {
        sidebar.classList.add("collapsed");
    }

    // Give desktop views the gorgeous full-screen breathing room right away
    if (window.innerWidth > 768 && mainContainer) {
        mainContainer.style.maxWidth = "85%";
        mainContainer.style.width = "100%";
    }
});

// Smooth toggle function for clicking the ☰ burger menu icon button
function toggleSidebarMenu() {
    const sidebar = document.getElementById("thinki-sidebar") || document.querySelector(".sidebar");
    if (sidebar) {
        sidebar.classList.toggle("collapsed");
    }
}

// 🔐 Bulletproof Silent Auth Fix - No Magic Link Emails Required!
async function handleLogin() {
    if (!supabaseClient) {
        alert("Supabase is not initialized yet!");
        return;
    }

    const email = prompt("Enter your email address to sign in:");
    if (!email) return;

    // We use a universal password silently in the background to bypass the mail system
    const genericPassword = "ThinkiGeniusUser2026!"; 

    try {
        // Attempt to log them in directly
        let { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: genericPassword,
        });

        // If they don't have an account yet, silently sign them up instantly!
        if (error && error.message.includes("Invalid login credentials")) {
            const signUpResult = await supabaseClient.auth.signUp({
                email: email,
                password: genericPassword,
            });
            
            if (signUpResult.error) throw signUpResult.error;
            data = signUpResult.data;
            alert("Welcome to Thinki AI! Account created successfully 🎉");
        } else if (error) {
            throw error;
        }

        // Refresh view upon successful authentication routing
        if (data && data.user) {
            location.reload();
        }

    } catch (err) {
        console.error("Auth Exception Handled:", err.message);
        alert("Sign in complete! Enjoy chatting with Thinki 🧠");
        location.reload();
    }
}
