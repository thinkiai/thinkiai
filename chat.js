const SUPABASE_URL = "https://ywnnfvmyqiftjdwrtvts.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bm5mdm15cWlmdGpkd3J0dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDcxMzMsImV4cCI6MjA5NDc4MzEzM30.GdUhICvaoDA0mUrn_6Ic6uJojh85w046yCGhObD285w";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;
let attachedImageBase64 = null;

// 💖 TRACKS THE PREMIUM SUBSCRIPTION STATUS (Default 'free', set to 'pro' when subscribed)
let userPlanStatus = 'free'; 

// 🧭 TRACKS THE ACTIVE CONVERSATION SESSION UNTIL A NEW ONE IS CREATED
let currentChatId = crypto.randomUUID(); 

// 🍔 CLEAN SIDEBAR TOGGLE FUNCTION (Declared directly for your HTML onclick execution)
function toggleSidebarMenu() {
    const sidebar = document.getElementById('thinki-sidebar') || document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

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
