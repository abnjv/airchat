import * as ui from './ui.js';
import * as api from './api.js';
import { connectSocket } from './socket.js';

// Centralized DOM elements and application state
export const elements = {
    homeScreen: document.getElementById('home-screen'),
    loginScreen: document.getElementById('login-screen'),
    signupScreen: document.getElementById('signup-screen'),
    roomsScreen: document.getElementById('rooms-screen'),
    chatRoomScreen: document.getElementById('chat-room-screen'),
    profileScreen: document.getElementById('profile-screen'),
    // Add all other element lookups here...
};

export let state = {
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

function setupEventListeners() {
    // Setup all event listeners, delegating to api.js or ui.js functions
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const success = await api.loginUser(elements.loginForm.elements['login-username'].value, elements.loginForm.elements['login-password'].value);
        if(success) {
            ui.showScreen('rooms-screen', elements);
            // etc.
        }
    });
    // ... all other listeners
}

function init() {
    const session = api.loadSession();
    if (session) {
        state.currentUser = session.currentUser;
        state.token = session.token;
        ui.showScreen('rooms-screen', elements);
    } else {
        ui.showScreen('home-screen', elements);
    }
    setupEventListeners();
}

init();
