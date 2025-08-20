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
    callModal: document.getElementById('call-modal'),
    callerName: document.getElementById('caller-name'),
    acceptCallBtn: document.getElementById('accept-call-btn'),
    declineCallBtn: document.getElementById('decline-call-btn'),
    hangUpBtn: document.getElementById('hang-up-btn'),
    leaveRoomBtn: document.getElementById('leave-room-btn'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
};

let state = {
    currentUser: null,
    token: null,
    rooms: [],
    currentRoom: null,
    socket: null,
    rtcHandler: null,
};

class WebRTCHandler {
    // ... (full class from before)
}

function showScreen(screenId) {
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');

    if (screenId === 'rooms-screen') {
        if (state.rtcHandler) state.rtcHandler.hangUp();
        fetchAndDisplayRooms();
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
    state = { currentUser: null, token: null, rooms: [], currentRoom: null, socket: null, rtcHandler: null };
    showScreen('home-screen');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function showMessage(message, isError = false) {
    if (!elements.messageBox || !elements.messageText) return;
    elements.messageText.textContent = message;
    const messageDiv = elements.messageBox.firstElementChild;
    if(isError) {
        messageDiv.classList.add('bg-red-500', 'text-white');
        messageDiv.classList.remove('bg-white', 'dark:bg-gray-800');
    } else {
        messageDiv.classList.remove('bg-red-500', 'text-white');
        messageDiv.classList.add('bg-white', 'dark:bg-gray-800');
    }
    elements.messageBox.classList.remove('hidden');
    setTimeout(() => {
        hideModal('message-box');
    }, 3000);
}

function addRoomToList(room) {
    const roomElement = document.createElement('div');
    roomElement.className = "p-5 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between";
    roomElement.onclick = () => joinRoom(room);
    roomElement.innerHTML = `...`; // Contents same as before
    elements.roomsListContainer.appendChild(roomElement);
}

function appendMessage(message) {
    if (message._id && document.getElementById(`msg-${message._id}`)) return;
    const isCurrentUser = message.sender._id === state.currentUser._id;
    const messageElement = document.createElement('div');
    if (message._id) messageElement.id = `msg-${message._id}`;
    messageElement.className = `flex items-start gap-3 my-4 ${isCurrentUser ? 'justify-end' : ''}`;
    const bubbleClasses = isCurrentUser ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none';
    messageElement.innerHTML = `...`; // Contents same as before
    elements.messagesContainer.appendChild(messageElement);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function renderParticipants(participants) {
    // ...
}

function joinRoom(room) {
    if (!state.socket) return;
    state.currentRoom = room;
    elements.roomTitle.textContent = room.name;
    elements.messagesContainer.innerHTML = '';
    elements.participantsContainer.innerHTML = '';
    showScreen('chat-room-screen');
    state.rtcHandler = new WebRTCHandler(state.socket);
    state.rtcHandler.startLocalMedia();
    state.socket.emit('joinRoom', { username: state.currentUser.username, room: room._id });
}

function handleSendMessage(event) {
    event.preventDefault();
    const text = elements.messageInput.value.trim();
    if (text && state.socket && state.currentRoom) {
        state.socket.emit('chatMessage', { room: state.currentRoom._id, text: text });
        const optimisticMessage = { _id: `temp-${Date.now()}`, text: text, sender: state.currentUser };
        appendMessage(optimisticMessage);
        elements.messageInput.value = '';
    }
}

function connectSocket() {
    if (state.socket || !state.token) return;
    state.socket = io({ auth: { token: state.token } });
    state.socket.on('connect', () => { if (state.currentUser) state.socket.emit('register-socket', state.currentUser._id); });
    state.socket.on('room_created', addRoomToList);
    state.socket.on('message', message => {
        const tempMsg = document.getElementById(`temp-${message.tempId}`);
        if(tempMsg) {
            tempMsg.id = `msg-${message._id}`;
        } else if (message.sender._id !== state.currentUser._id) {
            appendMessage(message);
        }
    });
    state.socket.on('message_history', history => {
        elements.messagesContainer.innerHTML = '';
        history.forEach(appendMessage);
    });
    state.socket.on('update_participants', renderParticipants);
    state.socket.on('voice-offer', data => state.rtcHandler && state.rtcHandler.handleOffer(data));
    state.socket.on('voice-answer', async data => state.rtcHandler && await state.rtcHandler.handleAnswer(data));
    state.socket.on('ice-candidate', async data => state.rtcHandler && await state.rtcHandler.handleCandidate(data));
    state.socket.on('hang-up', () => state.rtcHandler && state.rtcHandler.hangUp());
    state.socket.on('disconnect', () => { state.socket = null; });
}

// ... rest of file
