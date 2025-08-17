// =================================================================================
// DOM Element Sourcing
// =================================================================================
const elements = {
    homeScreen: document.getElementById('home-screen'),
    loginScreen: document.getElementById('login-screen'),
    signupScreen: document.getElementById('signup-screen'),
    roomsScreen: document.getElementById('rooms-screen'),
    chatRoomScreen: document.getElementById('chat-room-screen'),
    profileScreen: document.getElementById('profile-screen'),
    roomTitle: document.getElementById('room-title'),
    messagesContainer: document.getElementById('messages-container'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    geminiBtn: document.getElementById('gemini-btn'),
    profileFileInput: document.getElementById('profile-file-input'),
    profilePicture: document.getElementById('profile-picture'),
    zeroFrame: document.getElementById('zero-frame'),
    toggleZeroBtn: document.getElementById('toggle-zero-btn'),
    userIdElement: document.getElementById('user-id'),
    myProfilePic: document.getElementById('my-profile-pic'),
    myMicIcon: document.getElementById('my-mic-icon'),
    myGlowCircle: document.getElementById('my-glow-circle'),
    selfMuteBtn: document.getElementById('self-mute-btn'),
    userOptionsModal: document.getElementById('user-options-modal'),
    modalUsername: document.getElementById('modal-username'),
    callModal: document.getElementById('call-modal'),
    callerName: document.getElementById('caller-name'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    roomsListContainer: document.querySelector('#rooms-screen .space-y-4'),
    createRoomForm: document.getElementById('create-room-form'),
    logoutBtn: document.querySelector('#rooms-screen button'),
    participantsContainer: document.querySelector('#chat-room-screen .grid'),
};

// =================================================================================
// Application State
// =================================================================================
let state = {
    currentUser: null,
    token: null,
    rooms: [],
    currentRoom: null,
    socket: null,
    localStream: null,
    peerConnections: {},
    selectedUser: null,
    chatHistory: [],
};

// =================================================================================
// Core Functions (UI, Session, API)
// =================================================================================

function showScreen(screenId) {
    if (state.socket && screenId !== 'chat-room-screen') {
        state.socket.disconnect();
        state.socket = null;
        if (state.localStream) {
            state.localStream.getTracks().forEach(track => track.stop());
            state.localStream = null;
        }
        Object.values(state.peerConnections).forEach(pc => pc.close());
        state.peerConnections = {};
    }
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen, elements.profileScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));

    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');

    if (screenId === 'rooms-screen') fetchAndRenderRooms();
    if (screenId === 'profile-screen') renderProfile();
}

function showMessage(message, isError = false) {
    elements.messageText.textContent = message;
    elements.messageBox.classList.remove('hidden');
    setTimeout(() => {
        elements.messageBox.querySelector('div').classList.remove('scale-95', 'opacity-0');
        elements.messageBox.querySelector('div').classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.querySelector('div').classList.remove('scale-100', 'opacity-100');
        modal.querySelector('div').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            if (modalId === 'user-options-modal') state.selectedUser = null;
        }, 300);
    }
}

function saveSession(data) {
    state.currentUser = data.user || { _id: data._id, username: data.username, profilePicture: data.profilePicture };
    state.token = data.token;
    localStorage.setItem('airchat_session', JSON.stringify({ currentUser: state.currentUser, token: state.token }));
}

function loadSession() {
    const session = localStorage.getItem('airchat_session');
    if (session) {
        const { currentUser, token } = JSON.parse(session);
        state.currentUser = currentUser;
        state.token = token;
        return true;
    }
    return false;
}

function logout() {
    // ... (same as before)
}

// =================================================================================
// API Interaction & Rendering
// =================================================================================

async function fetchAndRenderRooms() { /* ... same as before ... */ }
function renderProfile() { /* ... same as before ... */ }
async function handleProfilePictureUpload(event) { /* ... same as before ... */ }
function showChatRoom(room) { /* ... same as before ... */ }
function appendMessage(msg) { /* ... same as before ... */ }

// =================================================================================
// Gemini AI Integration
// =================================================================================
async function sendToGemini() {
    const prompt = elements.messageInput.value.trim();
    if (prompt === '' || !state.token) return;

    appendMessage({ text: prompt, username: state.currentUser.username });
    elements.messageInput.value = '';

    const loadingId = `loading-${Date.now()}`;
    appendMessage({ text: 'جاري التفكير...', username: 'مساعد Gemini ✨', id: loadingId, isGemini: true });

    try {
        const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
            body: JSON.stringify({ prompt, history: state.chatHistory }),
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to get response');

        const data = await res.json();
        const responseText = data.response;

        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.parentElement.innerHTML = createMessageHTML({ text: responseText, username: 'مساعد Gemini ✨', isGemini: true });

        state.chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        state.chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    } catch (error) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.parentElement.remove();
        showMessage(`Gemini Error: ${error.message}`, true);
    }
}


// =================================================================================
// Moderation & User Interaction
// =================================================================================
function showUserOptions(username, userId) { /* ... same as before ... */ }
function kickUser() { /* ... same as before ... */ }

// =================================================================================
// WebRTC & WebSocket Logic
// =================================================================================
function connectToChat() { /* ... same as before, including 'kicked' listener ... */ }
function sendMessage() { /* ... same as before ... */ }
// ... All WebRTC handlers ...

// =================================================================================
// Event Listeners & Initialization
// =================================================================================
function setupEventListeners() {
    // ... all listeners including geminiBtn
    elements.geminiBtn.addEventListener('click', sendToGemini);
}
function init() { /* ... same as before ... */ }
init();
