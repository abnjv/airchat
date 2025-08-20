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
    callModal: document.getElementById('call-modal'),
    callerName: document.getElementById('caller-name'),
    acceptCallBtn: document.getElementById('accept-call-btn'),
    declineCallBtn: document.getElementById('decline-call-btn'),
    hangUpBtn: document.getElementById('hang-up-btn'),
};

let state = {
    currentUser: null,
    token: null,
    rooms: [],
    currentRoom: null,
    socket: null,
    localStream: null,
    peerConnections: {},
    selectedUserId: null,
    incomingOffer: null,
};

const peerConnectionConfig = {
    iceServers: [
        { 'urls': 'stun:stun.l.google.com:19302' },
        { 'urls': 'stun:stun1.l.google.com:19302' }
    ]
};

function showScreen(screenId) {
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');

    if (screenId === 'rooms-screen') {
        if(state.localStream) {
             state.localStream.getTracks().forEach(track => track.stop());
             state.localStream = null;
        }
        if(elements.videoContainer) elements.videoContainer.classList.add('hidden');
        closeAllPeerConnections();
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
    hangUp();
    if(state.socket) state.socket.disconnect();
    state = { currentUser: null, token: null, rooms: [], currentRoom: null, socket: null, localStream: null, peerConnections: {}, selectedUserId: null, incomingOffer: null };
    showScreen('home-screen');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function addRoomToList(room) {
    const roomElement = document.createElement('div');
    roomElement.className = "p-5 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between";
    roomElement.onclick = () => joinRoom(room);
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
            <span>${room.participants ? room.participants.length : 1}</span>
        </div>
    `;
    elements.roomsListContainer.appendChild(roomElement);
}

function appendMessage(message) {
    const isCurrentUser = message.sender.username === state.currentUser.username;
    const messageElement = document.createElement('div');
    messageElement.className = `flex items-start gap-3 my-4 ${isCurrentUser ? 'justify-end' : ''}`;
    const bubbleClasses = isCurrentUser ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none';
    messageElement.innerHTML = `
        <div class="chat-bubble flex-1 ${isCurrentUser ? 'text-right' : ''}">
            <div class="p-3 rounded-lg shadow-sm inline-block ${bubbleClasses}">
                ${!isCurrentUser ? `<span class="font-semibold text-xs block mb-1">${message.sender.username}</span>` : ''}
                <p class="text-sm">${message.text}</p>
            </div>
        </div>
    `;
    elements.messagesContainer.appendChild(messageElement);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function renderParticipants(participants) {
    if (!elements.participantsContainer) return;
    elements.participantsContainer.innerHTML = '';
    participants.forEach(participant => {
        if (participant._id === state.currentUser._id) return;
        const pElement = document.createElement('div');
        pElement.className = 'flex flex-col items-center cursor-pointer';
        pElement.onclick = () => showUserOptions(participant);
        pElement.innerHTML = `
            <div class="relative">
                <img src="${participant.profilePicture || 'https://placehold.co/128x128/3b82f6/ffffff?text=U'}" alt="${participant.username}" class="w-12 h-12 rounded-full border-2 border-transparent">
            </div>
            <span class="text-sm mt-1 text-gray-700 dark:text-gray-300">${participant.username}</span>
        `;
        elements.participantsContainer.appendChild(pElement);
    });
}

async function startLocalMedia() {
    if (state.localStream) return;
    try {
        state.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        elements.localVideo.srcObject = state.localStream;
        elements.videoContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

function createPeerConnection(targetUserId) {
    closeAllPeerConnections();
    const peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = event => {
        if (event.candidate) state.socket.emit('ice-candidate', { candidate: event.candidate, toUserId: targetUserId, fromUserId: state.currentUser._id });
    };
    peerConnection.ontrack = event => {
        elements.remoteVideo.srcObject = event.streams[0];
        elements.hangUpBtn.classList.remove('hidden');
    };
    peerConnection.onconnectionstatechange = () => {
        if (['disconnected', 'closed', 'failed'].includes(peerConnection.connectionState)) hangUp();
    };
    state.localStream.getTracks().forEach(track => peerConnection.addTrack(track, state.localStream));
    state.peerConnections[targetUserId] = peerConnection;
    return peerConnection;
}

function showUserOptions(user) {
    state.selectedUserId = user._id;
    elements.modalUsername.textContent = `Options for ${user.username}`;
    elements.userOptionsModal.classList.remove('hidden');
}

async function initiateCall() {
    if (!state.selectedUserId || !state.localStream) return;
    const targetUserId = state.selectedUserId;
    const peerConnection = createPeerConnection(targetUserId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    state.socket.emit('voice-offer', { offer, toUserId: targetUserId, fromUser: { _id: state.currentUser._id, username: state.currentUser.username } });
    hideModal('user-options-modal');
}

async function answerCall() {
    if (!state.incomingOffer || !state.localStream) return;
    const { offer, fromUser } = state.incomingOffer;
    const peerConnection = createPeerConnection(fromUser._id);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    state.socket.emit('voice-answer', { answer, toUserId: fromUser._id, fromUser: { _id: state.currentUser._id } });
    state.incomingOffer = null;
    hideModal('call-modal');
}

function declineCall() {
    state.incomingOffer = null;
    hideModal('call-modal');
}

function closeAllPeerConnections() {
    for (const key in state.peerConnections) {
        if (state.peerConnections[key]) state.peerConnections[key].close();
        delete state.peerConnections[key];
    }
}

function hangUp() {
    Object.keys(state.peerConnections).forEach(userId => {
        if (state.socket) state.socket.emit('hang-up', { toUserId: userId });
    });
    closeAllPeerConnections();
    if (elements.remoteVideo) elements.remoteVideo.srcObject = null;
    if (elements.videoContainer) elements.videoContainer.classList.add('hidden');
    if (elements.hangUpBtn) elements.hangUpBtn.classList.add('hidden');
}

function joinRoom(room) {
    if (!state.socket) return;
    state.currentRoom = room;
    elements.roomTitle.textContent = room.name;
    elements.messagesContainer.innerHTML = '';
    elements.participantsContainer.innerHTML = '';
    showScreen('chat-room-screen');
    startLocalMedia();
    state.socket.emit('joinRoom', { username: state.currentUser.username, room: room._id });
}

async function fetchAndDisplayRooms() {
    if (!state.token) return;
    try {
        const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${state.token}` } });
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const rooms = await res.json();
        state.rooms = rooms;
        elements.roomsListContainer.innerHTML = '';
        if (rooms.length === 0) {
            elements.roomsListContainer.innerHTML = `<p class="text-center text-gray-500">No rooms available. Create one!</p>`;
        } else {
            rooms.forEach(addRoomToList);
        }
    } catch (error) {
        console.error(error);
    }
}

async function handleCreateRoom(event) {
    event.preventDefault();
    const roomName = elements.createRoomNameInput.value.trim();
    if (!roomName || !state.token) return;
    try {
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
            body: JSON.stringify({ name: roomName })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to create room');
        elements.createRoomNameInput.value = '';
    } catch (error) {
        console.error(error);
    }
}

function handleSendMessage(event) {
    event.preventDefault();
    const text = elements.messageInput.value.trim();
    if (text && state.socket && state.currentRoom) {
        state.socket.emit('chatMessage', { room: state.currentRoom._id, text: text });
        appendMessage({ text: text, sender: state.currentUser });
        elements.messageInput.value = '';
    }
}

function connectSocket() {
    if (state.socket || !state.token) return;
    state.socket = io({ auth: { token: state.token } });
    state.socket.on('connect', () => {
        if (state.currentUser) state.socket.emit('register-socket', state.currentUser._id);
    });
    state.socket.on('room_created', addRoomToList);
    state.socket.on('message', message => {
        if (message.sender.username !== state.currentUser.username) appendMessage(message);
    });
    state.socket.on('update_participants', renderParticipants);
    state.socket.on('voice-offer', data => {
        state.incomingOffer = data;
        elements.callerName.textContent = `${data.fromUser.username} is calling`;
        elements.callModal.classList.remove('hidden');
    });
    state.socket.on('voice-answer', async data => {
        const peerConnection = state.peerConnections[data.fromUser._id];
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    });
    state.socket.on('ice-candidate', async data => {
        const peerConnection = state.peerConnections[data.fromUserId];
        if (peerConnection && data.candidate) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    });
    state.socket.on('hang-up', hangUp);
    state.socket.on('disconnect', () => { state.socket = null; });
}

function setupEventListeners() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
    elements.createRoomForm.addEventListener('submit', handleCreateRoom);
    elements.messageForm.addEventListener('submit', handleSendMessage);
    elements.showLoginBtn.addEventListener('click', () => showScreen('login-screen'));
    elements.showSignupBtn.addEventListener('click', () => showScreen('signup-screen'));
    elements.loginToSignupLink.addEventListener('click', e => { e.preventDefault(); showScreen('signup-screen'); });
    elements.signupToLoginLink.addEventListener('click', e => { e.preventDefault(); showScreen('login-screen'); });
    elements.logoutBtn.addEventListener('click', logout);
    elements.modalCallBtn.addEventListener('click', initiateCall);
    elements.acceptCallBtn.addEventListener('click', answerCall);
    elements.declineCallBtn.addEventListener('click', declineCall);
    elements.hangUpBtn.addEventListener('click', hangUp);
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
