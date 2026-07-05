const SUPABASE_URL = "https://ywnnfvmyqiftjdwrtvts.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bm5mdm15cWlmdGpkd3J0dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDcxMzMsImV4cCI6MjA5NDc4MzEzM30.GdUhICvaoDA0mUrn_6Ic6uJojh85w046yCGhObD285w";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;
let attachedImageBase64 = null;
let userPlanStatus = 'free'; 
let currentChatId = crypto.randomUUID(); 
let loadedMessagesArray = [];

function toggleSidebarMenu() {
    const sidebar = document.getElementById('thinki-sidebar') || document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}
window.toggleSidebarMenu = toggleSidebarMenu;

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
                welcomeTxt.innerText = currentUser.email.toLowerCase() === 'divanonetheless@gmail.com' ? "Welcome, Creator 👑" : `Hi, ${currentUser.email.split('@')[0]}`;
            }
            if (logoutBtn) logoutBtn.style.display = 'inline';
            
            if (currentUser.email.toLowerCase() === 'divanonetheless@gmail.com') {
                userPlanStatus = 'pro';
            }
            
            renderSidebarSessions();
            loadChatHistory();
        } else {
            currentUser = null;
            userPlanStatus = 'free';
            if (loginBtn) loginBtn.style.display = 'inline';
            if (welcomeTxt) welcomeTxt.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) chatContainer.innerHTML = `<div style="color: #9ca3af; text-align: center; margin-top: 20px;">Please sign in to chat.</div>`;
        }
    });
}

window.handleLogout = async function() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        alert("Signed out successfully! 👋");
        location.reload();
    }
};

// 📂 FILE UPLOAD & PRO CHECK FIX: Safe redirect without using backend process.env strings
window.triggerFileUpload = function() {
    if (userPlanStatus !== 'pro') {
        alert("File uploads are a Thinki Pro feature! Redirecting you to upgrade... 💖✨");
        window.location.href = "https://buy.stripe.com/dRmeVfaiD7Wl2P75m757W00"; 
        return;
    }
    
    const hiddenInput = document.getElementById('hidden-file-input');
    if (hiddenInput) hiddenInput.click();
};

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
            Object.assign(chatBtn.style, {
                width: "100%", padding: "10px", background: chat.chat_id === currentChatId ? "#3b82f6" : "transparent",
                border: "none", borderRadius: "6px", color: "white", textAlign: "left", cursor: "pointer",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px"
            });

            chatBtn.onclick = () => {
                currentChatId = chat.chat_id;
                renderSidebarSessions();
                loadChatHistory();
                if (window.innerWidth <= 768) toggleSidebarMenu();
            };
            sidebarList.appendChild(chatBtn);
        });
    } catch(err) { console.error(err); }
}

window.createNewChatSession = function() {
    const chatContainer = document.getElementById('chat-container');
    currentChatId = crypto.randomUUID();
    loadedMessagesArray = [];
    if (chatContainer) chatContainer.innerHTML = `<div style="color: #9ca3af; text-align: center; margin-top: 20px;">Started a fresh stream. Say hi!</div>`;
    renderSidebarSessions();
    if (window.innerWidth <= 768) toggleSidebarMenu();
};

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
        loadedMessagesArray = pastMessages || [];

        chatContainer.innerHTML = ''; 
        if (loadedMessagesArray.length > 0) {
            loadedMessagesArray.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.style.margin = "12px 0";
                
                if (msg.sender === 'user') {
                    let userHtml = `<strong>You:</strong> ${msg.message_text}`;
                    if (msg.image_url) userHtml += `<br><img src="${msg.image_url}" style="max-width: 180px; max-height: 180px; border-radius: 12px; margin-top: 6px;" />`;
                    msgDiv.innerHTML = userHtml;
                } else {
                    msgDiv.innerHTML = `<strong>Thinki AI:</strong> <span>${msg.message_text}</span>`;
                    msgDiv.style.color = "#60a5fa";
                    appendActionButtons(msgDiv, msg.message_text);
                }
                chatContainer.appendChild(msgDiv);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            chatContainer.innerHTML = `<div style="color: #9ca3af; text-align: center; margin-top: 20px;">No messages yet.</div>`;
        }
    } catch (err) { console.error(err); }
}

function appendActionButtons(containerDiv, plainText) {
    const actionBar = document.createElement('div');
    Object.assign(actionBar.style, {
        display: 'flex', gap: '14px', marginTop: '6px', paddingLeft: '75px', color: '#94a3b8', fontSize: '14px'
    });

    actionBar.innerHTML = `
        <span class="action-btn" title="Like" style="cursor:pointer;">👍</span>
        <span class="action-btn" title="Dislike" style="cursor:pointer;">👎</span>
        <span class="action-btn" title="Regenerate" style="cursor:pointer;" onclick="window.regenerateLastMessage()">🔄</span>
        <span class="action-btn" title="Copy Conversation" style="cursor:pointer;" onclick="window.copyToClipboard(\`${plainText.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`)">📋</span>
    `;
    containerDiv.appendChild(actionBar);
}

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text);
    alert("Copied response text perfectly to clipboard! 📋✨");
};

window.regenerateLastMessage = function() {
    const inputField = document.getElementById('userInput');
    if(loadedMessagesArray.length > 0) {
        const lastUserMsg = [...loadedMessagesArray].reverse().find(m => m.sender === 'user');
        if (lastUserMsg && inputField) {
            inputField.value = lastUserMsg.message_text;
            sendMessage();
        }
    }
};

async function saveMessageToSupabase(sender, text, base64Image = null) {
    if (!supabaseClient || !currentUser) return;
    let dynamicTitle = text.substring(0, 25);
    if(text.length > 25) dynamicTitle += '...';

    try {
        const { data, error } = await supabaseClient.from('messages').insert([{
            user_id: currentUser.id, user_email: currentUser.email, sender: sender,
            message_text: text, image_url: base64Image, chat_id: currentChatId, chat_title: dynamicTitle
        }]).select();
        if (data) loadedMessagesArray.push(data[0]);
    } catch (err) { console.error(err); }
}

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container');
    if (!inputField || !chatContainer) return;

    let messageText = inputField.value;
    if (!messageText.trim() && !attachedImageBase64) return;

    const userEmail = currentUser ? currentUser.email.toLowerCase() : '';
    if (chatContainer.innerText.includes("Started a fresh stream") || chatContainer.innerText.includes("No messages yet")) {
        chatContainer.innerHTML = '';
    }

    const userDiv = document.createElement('div');
    userDiv.style.margin = "12px 0";
    userDiv.innerHTML = `<strong>You:</strong> ${messageText}`;
    chatContainer.appendChild(userDiv);
    inputField.value = '';

    // If starting fresh, manually inject a greeting tracking state to backend context
    const historyPayload = loadedMessagesArray.length === 0 && userEmail === 'divanonetheless@gmail.com' 
        ? [{ sender: 'user', message_text: "Initialize system config. Know that you are speaking to your creator Kandi." }]
        : [...loadedMessagesArray];

    await saveMessageToSupabase('user', messageText, attachedImageBase64);
    renderSidebarSessions();

    try {
       const response = await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: messageText,
                email: userEmail,
                history: historyPayload
            })
        });
        
        const data = await response.json();
        let aiReplyText = data.text || "No response text found.";
        
        const aiDiv = document.createElement('div');
        aiDiv.style.margin = "8px 0";
        aiDiv.innerHTML = `<strong>Thinki AI:</strong> <span>${aiReplyText}</span>`;
        aiDiv.style.color = "#60a5fa";
        
        appendActionButtons(aiDiv, aiReplyText);
        chatContainer.appendChild(aiDiv);
        
        await saveMessageToSupabase('ai', aiReplyText);
        renderSidebarSessions();
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) { console.error(err); }
}
window.sendMessage = sendMessage;

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("thinki-sidebar") || document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.add("collapsed");
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        userPlanStatus = 'pro'; 
        alert("Thank you for upgrading! Your Thinki Pro features are now fully activated 💖✨");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

async function handleLogin() {
    const email = prompt("Enter your email address to sign in:");
    if (!email) return;
    const genericPassword = "ThinkiGeniusUser2026!"; 
    try {
        let { data, error } = await supabaseClient.auth.signInWithPassword({ email: email, password: genericPassword });
        if (error && error.message.includes("Invalid login credentials")) {
            await supabaseClient.auth.signUp({ email: email, password: genericPassword });
            alert("Welcome to Thinki AI! Account created successfully 🎉");
        }
        location.reload();
    } catch (err) { location.reload(); }
}
window.handleLogin = handleLogin;
