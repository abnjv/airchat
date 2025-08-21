const elements = {
    homeScreen: document.getElementById('home-screen'),
    loginScreen: document.getElementById('login-screen'),
    signupScreen: document.getElementById('signup-screen'),
    roomsScreen: document.getElementById('rooms-screen'),
    chatRoomScreen: document.getElementById('chat-room-screen'),
    profileScreen: document.getElementById('profile-screen'),
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
    profileUsername: document.getElementById('profile-username'),
    profileBio: document.getElementById('profile-bio'),
    editBioBtn: document.getElementById('edit-bio-btn'),
    bioDisplayContainer: document.getElementById('bio-display-container'),
    bioEditContainer: document.getElementById('bio-edit-container'),
    bioTextarea: document.getElementById('bio-textarea'),
    saveBioBtn: document.getElementById('save-bio-btn'),
    cancelEditBioBtn: document.getElementById('cancel-edit-bio-btn'),
    profilePicture: document.getElementById('profile-picture'),
    profileFileInput: document.getElementById('profile-file-input'),
};

let state = {
    // ...
};

// ... WebRTCHandler Class ...

function showScreen(screenId) {
    // ...
    if (screenId === 'profile-screen') {
        renderProfile();
    }
    // ...
}

// ... other functions

function renderProfile() {
    if (!state.currentUser) return;
    elements.profileUsername.textContent = state.currentUser.username;
    elements.profileBio.textContent = state.currentUser.bio || 'No bio yet...';
    elements.profilePicture.src = state.currentUser.profilePicture;
    // Also update other instances of the profile picture if they exist
    if (elements.myProfilePic) elements.myProfilePic.src = state.currentUser.profilePicture;
}

function showBioEdit(show) {
    elements.bioDisplayContainer.classList.toggle('hidden', show);
    elements.bioEditContainer.classList.toggle('hidden', !show);
    if (show) {
        elements.bioTextarea.value = state.currentUser.bio;
    }
}

async function updateProfileBio() {
    const newBio = elements.bioTextarea.value;
    try {
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
            body: JSON.stringify({ bio: newBio })
        });
        if (!res.ok) throw new Error('Failed to update bio');
        const updatedUser = await res.json();
        state.currentUser.bio = updatedUser.bio;
        saveSession(state.currentUser); // Re-save session with new bio
        renderProfile();
        showBioEdit(false);
    } catch (error) {
        console.error(error);
        showMessage('Could not update bio.', true);
    }
}

async function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
        const res = await fetch('/api/profile/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` },
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload picture');
        const data = await res.json();
        state.currentUser.profilePicture = data.profilePicture;
        saveSession(state.currentUser); // Re-save session with new picture
        renderProfile();
        showMessage('Profile picture updated!');
    } catch (error) {
        console.error(error);
        showMessage('Could not upload picture.', true);
    }
}

function setupEventListeners() {
    // ...
    elements.editBioBtn.addEventListener('click', () => showBioEdit(true));
    elements.cancelEditBioBtn.addEventListener('click', () => showBioEdit(false));
    elements.saveBioBtn.addEventListener('click', updateProfileBio);
    elements.profilePicture.addEventListener('click', () => elements.profileFileInput.click());
    elements.profileFileInput.addEventListener('change', handleProfilePictureUpload);
}

// ... init
