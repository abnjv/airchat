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
    // ... other elements
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
    // ... other state properties
};

// =================================================================================
// Core Functions (UI, Session, API)
// =================================================================================

function showScreen(screenId) {
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));

    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.remove('hidden');
    }

    // If we are showing the rooms screen, fetch and render the rooms.
    if (screenId === 'rooms-screen') {
        fetchAndDisplayRooms();
        connectSocket(); // Connect socket when entering rooms screen
    } else {
        // Disconnect socket if we leave the rooms area
        if (state.socket) {
            state.socket.disconnect();
            state.socket = null;
        }
    }
}

function saveSession(data) {
    state.currentUser = { _id: data._id, username: data.username };
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
    localStorage.removeItem('airchat_session');
    state.currentUser = null;
    state.token = null;
    showScreen('home-screen');
}

// =================================================================================
// API Interaction & Rendering
// =================================================================================

function addRoomToList(room) {
    const roomElement = document.createElement('div');
    roomElement.className = "p-5 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between";
    roomElement.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
                ${room.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 class="font-semibold text-lg">${room.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Owner: ${room.owner.username}</p>
            </div>
        </div>
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <i class="fas fa-users"></i>
            <span>${room.participants.length}</span>
        </div>
    `;
    // roomElement.onclick = () => showChatRoom(room); // Future functionality
    elements.roomsListContainer.appendChild(roomElement);
}

async function fetchAndDisplayRooms() {
    if (!state.token) return;
    try {
        const res = await fetch('/api/rooms', {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch rooms');

        const rooms = await res.json();
        state.rooms = rooms;

        elements.roomsListContainer.innerHTML = ''; // Clear existing list
        if (rooms.length === 0) {
            elements.roomsListContainer.innerHTML = `<p class="text-center text-gray-500">No rooms available. Create one to start chatting!</p>`;
        } else {
            rooms.forEach(addRoomToList);
        }
    } catch (error) {
        console.error(error);
        // showMessage('Could not load rooms.', true);
    }
}

async function handleCreateRoom(event) {
    event.preventDefault();
    const roomName = elements.createRoomNameInput.value.trim();
    if (!roomName || !state.token) return;

    try {
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ name: roomName })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to create room');
        }

        // The room will be added via the socket event, so we don't need to do anything here
        // except clear the input.
        elements.createRoomNameInput.value = '';

    } catch (error) {
        console.error(error);
        // showMessage(error.message, true);
    }
}

// =================================================================================
// WebSocket Logic
// =================================================================================
function connectSocket() {
    if (state.socket || !state.token) return;

    state.socket = io({
        auth: { token: state.token }
    });

    state.socket.on('connect', () => {
        console.log('Socket connected:', state.socket.id);
        // Register user ID with socket for signaling
        if (state.currentUser) {
            state.socket.emit('register-socket', state.currentUser._id);
        }
    });

    state.socket.on('room_created', (newRoom) => {
        console.log('New room created event received:', newRoom);
        // Add the new room to the list without a full refresh
        addRoomToList(newRoom);
    });

    state.socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });
}


// =================================================================================
// Event Listeners & Initialization
// =================================================================================

async function handleLogin(event) {
    event.preventDefault();
    const username = elements.loginForm.elements['login-username'].value;
    const password = elements.loginForm.elements['login-password'].value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        saveSession(data);
        showScreen('rooms-screen');
    } catch (error) {
        console.error('Login failed:', error);
        // showMessage(error.message, true);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const username = elements.signupForm.elements['signup-username'].value;
    const password = elements.signupForm.elements['signup-password'].value;
    // You might want to add confirm password validation here

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        saveSession(data);
        showScreen('rooms-screen');
    } catch (error) {
        console.error('Signup failed:', error);
        // showMessage(error.message, true);
    }
}


function setupEventListeners() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
    elements.createRoomForm.addEventListener('submit', handleCreateRoom);
    elements.logoutBtn.addEventListener('click', logout);
    // ... other event listeners
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
