// --- DOM Elements ---
const app = document.getElementById('app');
const homeScreen = document.getElementById('home-screen');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const roomsScreen = document.getElementById('rooms-screen');
const chatRoomScreen = document.getElementById('chat-room-screen');
const roomTitle = document.getElementById('room-title');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const roomsListContainer = document.getElementById('rooms-list-container');
const createRoomForm = document.getElementById('create-room-form');
const logoutBtn = document.getElementById('logout-btn');

// --- State Management ---
let state = {
    currentUser: null,
    token: null,
    rooms: [],
    currentRoom: null,
    socket: null,
};

// --- API & Core Functions ---

function saveSession(userData) {
    state.currentUser = userData.user || userData;
    state.token = userData.token;
    localStorage.setItem('airchat_session', JSON.stringify({ currentUser: state.currentUser, token: state.token }));
}

function loadSession() {
    const session = localStorage.getItem('airchat_session');
    if (session) {
        const parsedSession = JSON.parse(session);
        state.currentUser = parsedSession.currentUser;
        state.token = parsedSession.token;
        return true;
    }
    return false;
}

function clearSession() {
    if (state.socket) {
        state.socket.disconnect();
    }
    state = { currentUser: null, token: null, rooms: [], currentRoom: null, socket: null };
    localStorage.removeItem('airchat_session');
    showScreen('home-screen');
}

async function fetchAndRenderRooms() {
    if (!state.token) return;
    try {
        const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${state.token}` } });
        if (!res.ok) throw new Error('Could not fetch rooms');
        state.rooms = await res.json();
        roomsListContainer.innerHTML = '';
        if (state.rooms.length === 0) {
            roomsListContainer.innerHTML = '<p class="text-center text-gray-500">No rooms available. Create one!</p>';
            return;
        }
        state.rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'p-5 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between';
            roomCard.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl"><i class="fas fa-users"></i></div>
                    <div>
                        <h3 class="font-semibold text-lg">${room.name}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Participants: ${room.participants.length}</p>
                    </div>
                </div>
            `;
            roomCard.onclick = () => showChatRoom(room);
            roomsListContainer.appendChild(roomCard);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        roomsListContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
}

function showScreen(screenId) {
    if (state.socket && screenId !== 'chat-room-screen') {
        state.socket.disconnect();
        state.socket = null;
    }
    const screens = [homeScreen, loginScreen, signupScreen, roomsScreen, chatRoomScreen];
    screens.forEach(screen => screen && screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.remove('hidden');
    }
    if (screenId === 'rooms-screen') {
        fetchAndRenderRooms();
    }
}

function showChatRoom(room) {
    state.currentRoom = room;
    roomTitle.textContent = room.name;
    messagesContainer.innerHTML = '';
    showScreen('chat-room-screen');
    connectToChat();
}

function connectToChat() {
    if (state.socket) {
        state.socket.disconnect();
    }
    state.socket = io();
    state.socket.on('connect', () => {
        console.log('Socket connected!');
        state.socket.emit('joinRoom', { username: state.currentUser.username, room: state.currentRoom._id });
    });
    state.socket.on('message', (message) => {
        appendMessage(message);
    });
}

function appendMessage(msg) {
    const messageWrapper = document.createElement('div');
    const messageBubble = document.createElement('div');

    // System message
    if (typeof msg === 'string') {
        messageWrapper.className = 'text-center my-2';
        messageBubble.className = 'inline-block bg-gray-200 dark:bg-gray-600 text-sm rounded-full px-3 py-1';
        messageBubble.textContent = msg;
    } else { // User message
        const isMyMessage = msg.username === state.currentUser.username;
        messageWrapper.className = `flex items-start gap-3 ${isMyMessage ? 'justify-end' : ''}`;
        messageBubble.className = `flex-1 ${isMyMessage ? 'text-right' : ''}`;
        const content = `
            <div class="inline-block ${isMyMessage ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} p-4 rounded-xl ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'} shadow-md">
                ${!isMyMessage ? `<span class="font-semibold text-sm">${msg.username}</span>` : ''}
                <p class="mt-1">${msg.text}</p>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 block">${new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}</span>
        `;
        messageBubble.innerHTML = content;
    }
    messageWrapper.appendChild(messageBubble);
    messagesContainer.appendChild(messageWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '' || !state.socket) return;
    state.socket.emit('chatMessage', {
        room: state.currentRoom._id,
        message: {
            text: messageText,
            username: state.currentUser.username
        }
    });
    messageInput.value = '';
}

// --- Event Listeners ---
const darkModeToggle = document.getElementById('dark-mode-toggle');

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        // Optional: Change icon
        const icon = darkModeToggle.querySelector('i');
        if (document.body.classList.contains('dark')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}


if (logoutBtn) logoutBtn.addEventListener('click', clearSession);
if (createRoomForm) {
    createRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const roomNameInput = document.getElementById('create-room-name');
        const roomName = roomNameInput.value.trim();
        if (!roomName) return;
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
                body: JSON.stringify({ name: roomName }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Failed to create room');
            roomNameInput.value = '';
            fetchAndRenderRooms();
        } catch (error) {
            alert(`Create Room Error: ${error.message}`);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            saveSession(data);
            showScreen('rooms-screen');
        } catch (error) {
            alert(`Login Error: ${error.message}`);
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        if (password !== document.getElementById('signup-confirm-password').value) return alert('Passwords do not match!');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Signup failed');
            saveSession(data);
            showScreen('rooms-screen');
        } catch (error) {
            alert(`Signup Error: ${error.message}`);
        }
    });
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// --- App Initialization ---

function init() {
    if (loadSession()) {
        showScreen('rooms-screen');
    } else {
        showScreen('home-screen');
    }
}

init();
