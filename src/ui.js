export function showScreen(screenId, elements) {
    const allScreens = [elements.homeScreen, elements.loginScreen, elements.signupScreen, elements.roomsScreen, elements.chatRoomScreen];
    allScreens.forEach(screen => screen && screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

export function showMessage(message, isError = false, elements) {
    if (!elements.messageBox || !elements.messageText) return;
    elements.messageText.textContent = message;
    // ... styling logic
    elements.messageBox.classList.remove('hidden');
    setTimeout(() => hideModal('message-box'), 3000);
}

export function addRoomToList(room, elements, joinRoomCallback) {
    const roomElement = document.createElement('div');
    roomElement.className = "p-5 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md cursor-pointer ...";
    roomElement.onclick = () => joinRoomCallback(room);
    // ... innerHTML
    elements.roomsListContainer.appendChild(roomElement);
}

export function appendMessage(message, state, elements) {
    // ... logic
}

export function renderParticipants(participants, state, elements, showUserOptionsCallback) {
    // ... logic
}

export function renderProfile(state, elements) {
    // ... logic
}

export function showBioEdit(show, state, elements) {
    // ... logic
}
