// =================================================================================
// DOM Element Sourcing
// =================================================================================
const elements = {
    homeScreen: document.getElementById('home-screen'),
    loginScreen: document.getElementById('login-screen'),
    signupScreen: document.getElementById('signup-screen'),
    roomsScreen: document.getElementById('rooms-screen'),
    chatRoomScreen: document.getElementById('chat-room-screen'),
    roomTitle: document.getElementById('room-title'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    roomsListContainer: document.getElementById('rooms-list-container'),
    createRoomForm: document.getElementById('create-room-form'),
    createRoomNameInput: document.getElementById('create-room-name'),
    logoutBtn: document.getElementById('logout-btn'),
    showLoginBtn: document.getElementById('show-login-btn'),
    showSignupBtn: document.getElementById('show-signup-btn'),
    loginToSignupLink: document.getElementById('login-to-signup-link'),
    signupToLoginLink: document.getElementById('signup-to-login-link'),
    messagesContainer: document.getElementById('messages-container'),
    messageForm: document.getElementById('message-form'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    participantsContainer: document.querySelector('#chat-room-screen .grid'),
    videoContainer: document.getElementById('video-container'),
    localVideo: document.getElementById('local-video'),
    remoteVideo: document.getElementById('remote-video'),
    userOptionsModal: document.getElementById('user-options-modal'),
    modalUsername: document.getElementById('modal-username'),
    modalCallBtn: document.getElementById('modal-call-btn'),
    modalKickBtn: document.getElementById('modal-kick-btn'),
    modalMessageBtn: document.getElementById('modal-message-btn'),
    callModal: document.getElementById('call-modal'),
    callerName: document.getElementById('caller-name'),
    acceptCallBtn: document.getElementById('accept-call-btn'),
    declineCallBtn: document.getElementById('decline-call-btn'),
    hangUpBtn: document.getElementById('hang-up-btn'),
    leaveRoomBtn: document.getElementById('leave-room-btn'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
    conversationsListContainer: document.getElementById('conversations-list-container'),
};

// =================================================================================
// Application State
// =================================================================================
let state = {
    currentUser: null,
    token: null,
    rooms: [],
    conversations: [],
    currentRoom: null,
    currentConversation: null,
    socket: null,
    rtcHandler: null,
    selectedUserId: null,
};

// =================================================================================
// WebRTC Handler Class
// =================================================================================
class WebRTCHandler {
    constructor(socket) {
        this.socket = socket;
        this.localStream = null;
        this.peerConnections = {};
        this.incomingOffer = null;
        this.config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    }
    // ... All WebRTC methods from before
}


// =================================================================================
// Main Application Logic & Functions
// =================================================================================

function showScreen(screenId) {
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');

    if (screenId === 'rooms-screen') {
        if (state.rtcHandler) state.rtcHandler.hangUp();
        fetchAndDisplayRooms();
        fetchAndDisplayConversations();
        connectSocket();
    } else if (screenId !== 'chat-room-screen') {
        if (state.socket) state.socket.disconnect();
    }
}

function saveSession(data) {
    state.currentUser = { _id: data._id, username: data.username, profilePicture: data.profilePicture };
    state.token = data.token;
    localStorage.setItem('airchat_session', JSON.stringify({ currentUser: state.currentUser, token: state.token }));
}

function loadSession() {
    const session = localStorage.getItem('airchat_session');
    if (!session) return false;
    const { currentUser, token } = JSON.parse(session);
    state.currentUser = currentUser;
    state.token = token;
    return true;
}

function logout() {
    localStorage.removeItem('airchat_session');
    if (state.rtcHandler) state.rtcHandler.hangUp();
    if (state.socket) state.socket.disconnect();
    state = { currentUser: null, token: null, rooms: [], conversations: [], currentRoom: null, currentConversation: null, socket: null, rtcHandler: null, selectedUserId: null };
    showScreen('home-screen');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function showMessage(message, isError = false) {
    // ...
}

function addRoomToList(room) {
    // ...
}

function addConversationToList(convo) {
    const otherParticipant = convo.participants.find(p => p._id !== state.currentUser._id);
    if (!otherParticipant) return;

    const convoElement = document.createElement('div');
    convoElement.className = "p-3 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600";
    convoElement.onclick = () => joinConversation(convo);
    convoElement.innerHTML = `
        <h4 class="font-semibold">${otherParticipant.username}</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">${convo.lastMessage ? convo.lastMessage.text : 'No messages yet'}</p>
    `;
    elements.conversationsListContainer.appendChild(convoElement);
}

async function fetchAndDisplayConversations() {
    if (!state.token) return;
    try {
        const res = await fetch('/api/conversations', { headers: { 'Authorization': `Bearer ${state.token}` } });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const conversations = await res.json();
        state.conversations = conversations;
        elements.conversationsListContainer.innerHTML = '';
        if (conversations.length > 0) {
            conversations.forEach(addConversationToList);
        }
    } catch (error) {
        console.error(error);
    }
}

async function startConversation() {
    if (!state.selectedUserId) return;
    try {
        const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
            body: JSON.stringify({ userId: state.selectedUserId })
        });
        if (!res.ok) throw new Error('Could not start conversation');
        const conversation = await res.json();
        joinConversation(conversation);
    } catch (error) {
        console.error(error);
    }
}

function joinConversation(convo) {
    state.currentRoom = null;
    state.currentConversation = convo;
    const otherParticipant = convo.participants.find(p => p._id !== state.currentUser._id);
    elements.roomTitle.textContent = `Chat with ${otherParticipant.username}`;
    elements.messagesContainer.innerHTML = '';
    // In a real app, you'd fetch message history for the conversation here
    showScreen('chat-room-screen');
}

function handleSendMessage(event) {
    event.preventDefault();
    const text = elements.messageInput.value.trim();
    if (!text || !state.socket) return;

    if (state.currentRoom) {
        state.socket.emit('chatMessage', { room: state.currentRoom._id, text: text });
        appendMessage({ text: text, sender: state.currentUser });
    } else if (state.currentConversation) {
        state.socket.emit('private_message', {
            conversationId: state.currentConversation._id,
            text: text,
        });
        appendMessage({ text: text, sender: state.currentUser });
    }
    elements.messageInput.value = '';
}

function connectSocket() {
    if (state.socket || !state.token) return;
    state.socket = io({ auth: { token: state.token } });

    state.socket.on('private_message', (message) => {
        if (state.currentConversation && state.currentConversation._id === message.conversation) {
            if (message.sender._id !== state.currentUser._id) {
                appendMessage(message);
            }
        }
        fetchAndDisplayConversations();
    });

    // ... other listeners
}

function setupEventListeners() {
    // ...
    elements.modalMessageBtn.addEventListener('click', startConversation);
}

function init() {
    if (loadSession()) {
        showScreen('rooms-screen');
    } else {
        showScreen('home-screen');
    }
    setupEventListeners();
}

init();
