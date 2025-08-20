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
    callModal: document.getElementById('call-modal'),
    callerName: document.getElementById('caller-name'),
    acceptCallBtn: document.getElementById('accept-call-btn'),
    declineCallBtn: document.getElementById('decline-call-btn'),
    hangUpBtn: document.getElementById('hang-up-btn'),
    leaveRoomBtn: document.getElementById('leave-room-btn'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
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
    rtcHandler: null,
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

    async startLocalMedia() {
        if (this.localStream) return;
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            elements.localVideo.srcObject = this.localStream;
            elements.videoContainer.classList.remove('hidden');
        } catch (error) {
            console.error("Error accessing media devices.", error);
            showMessage("Could not access camera/mic.", true);
        }
    }

    createPeerConnection(targetUserId) {
        this.closeAllPeerConnections();
        const pc = new RTCPeerConnection(this.config);
        pc.onicecandidate = e => {
            if (e.candidate) this.socket.emit('ice-candidate', { candidate: e.candidate, toUserId: targetUserId, fromUserId: state.currentUser._id });
        };
        pc.ontrack = e => {
            elements.remoteVideo.srcObject = e.streams[0];
            elements.hangUpBtn.classList.remove('hidden');
        };
        pc.onconnectionstatechange = () => {
            if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) this.hangUp();
        };
        this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
        this.peerConnections[targetUserId] = pc;
        return pc;
    }

    async initiateCall(targetUserId) {
        if (!targetUserId || !this.localStream) return;
        const pc = this.createPeerConnection(targetUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.socket.emit('voice-offer', { offer, toUserId: targetUserId, fromUser: { _id: state.currentUser._id, username: state.currentUser.username } });
        hideModal('user-options-modal');
    }

    async handleOffer(data) {
        this.incomingOffer = data;
        elements.callerName.textContent = `${data.fromUser.username} is calling`;
        elements.callModal.classList.remove('hidden');
    }

    async answerCall() {
        if (!this.incomingOffer || !this.localStream) return;
        const { offer, fromUser } = this.incomingOffer;
        const pc = this.createPeerConnection(fromUser._id);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('voice-answer', { answer, toUserId: fromUser._id, fromUser: { _id: state.currentUser._id } });
        this.incomingOffer = null;
        hideModal('call-modal');
    }

    async handleAnswer(data) {
        const pc = this.peerConnections[data.fromUser._id];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    async handleCandidate(data) {
        const pc = this.peerConnections[data.fromUserId];
        if (pc && data.candidate) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    }

    closeAllPeerConnections() {
        for (const key in this.peerConnections) {
            if (this.peerConnections[key]) this.peerConnections[key].close();
            delete this.peerConnections[key];
        }
    }

    hangUp() {
        Object.keys(this.peerConnections).forEach(userId => {
            if (this.socket) this.socket.emit('hang-up', { toUserId: userId });
        });
        this.closeAllPeerConnections();
        if (elements.remoteVideo) elements.remoteVideo.srcObject = null;
        if (elements.videoContainer) elements.videoContainer.classList.add('hidden');
        if (elements.hangUpBtn) elements.hangUpBtn.classList.add('hidden');
    }
}


// =================================================================================
// Main Application Logic & Functions
// =================================================================================

function showScreen(screenId) {
    // ... (same as before, but a bit simpler)
}

function saveSession(data) {
    // ... (same as before)
}

function loadSession() {
    // ... (same as before)
}

function logout() {
    localStorage.removeItem('airchat_session');
    if (state.rtcHandler) state.rtcHandler.hangUp();
    if (state.socket) state.socket.disconnect();
    state = { currentUser: null, token: null, rooms: [], currentRoom: null, socket: null, rtcHandler: null };
    showScreen('home-screen');
}

function hideModal(modalId) {
    // ... (same as before)
}

function showMessage(message, isError = false) {
    // ... (same as before)
}

function addRoomToList(room) {
    // ... (same as before)
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

// ... other functions

function connectSocket() {
    if (state.socket || !state.token) return;
    state.socket = io({ auth: { token: state.token } });

    state.socket.on('voice-offer', data => state.rtcHandler && state.rtcHandler.handleOffer(data));
    state.socket.on('voice-answer', async data => state.rtcHandler && await state.rtcHandler.handleAnswer(data));
    state.socket.on('ice-candidate', async data => state.rtcHandler && await state.rtcHandler.handleCandidate(data));
    state.socket.on('hang-up', () => state.rtcHandler && state.rtcHandler.hangUp());
    // ... other listeners
}

function setupEventListeners() {
    // ...
    elements.modalCallBtn.addEventListener('click', () => state.rtcHandler && state.rtcHandler.initiateCall(state.selectedUserId));
    elements.acceptCallBtn.addEventListener('click', () => state.rtcHandler && state.rtcHandler.answerCall());
    elements.declineCallBtn.addEventListener('click', () => state.rtcHandler && state.rtcHandler.declineCall());
    elements.hangUpBtn.addEventListener('click', () => state.rtcHandler && state.rtcHandler.hangUp());
    // ...
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
