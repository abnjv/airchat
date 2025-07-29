document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatArea = document.getElementById('chat-area');
    const roomUsersList = document.getElementById('room-users');
    const userCountSpan = document.getElementById('user-count');

    // Simulate room users (for frontend display)
    const currentRoomUsers = JSON.parse(localStorage.getItem('currentRoomUsers')) || [];
    if (currentRoomUsers.length === 0) {
        // Initialize with dummy users if empty
        const dummyUsers = [
            { username: 'Admin', avatar: 'assets/images/default-avatar.png', rank: 'مشرف' },
            { username: 'Mahmoud', avatar: 'assets/images/default-avatar.png', rank: 'عضو' },
            { username: 'Fatima', avatar: 'assets/images/default-avatar.png', rank: 'عضو' },
            { username: 'Ali', avatar: 'assets/images/default-avatar.png', rank: 'عضو' },
            { username: 'Noura', avatar: 'assets/images/default-avatar.png', rank: 'VIP' },
        ];
        localStorage.setItem('currentRoomUsers', JSON.stringify(dummyUsers));
        updateRoomUsersDisplay(dummyUsers);
    } else {
        updateRoomUsersDisplay(currentRoomUsers);
    }

    // Add current user to room user list if not already present
    let currentUser = getCurrentUser();
    if (currentUser && !currentRoomUsers.some(u => u.username === currentUser.username)) {
        currentRoomUsers.push({
            username: currentUser.username,
            avatar: currentUser.avatar,
            rank: currentUser.rank
        });
        localStorage.setItem('currentRoomUsers', JSON.stringify(currentRoomUsers));
        updateRoomUsersDisplay(currentRoomUsers);
        displaySystemMessage(`${currentUser.username} انضم إلى الغرفة.`);
        playSound('welcome-sound');
    }

    if (sendChatBtn && chatInput && chatArea) {
        sendChatBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        const user = getCurrentUser(); // Get current user from user.js helper
        if (!user) {
            alert('الرجاء تسجيل الدخول لإرسال الرسائل.');
            window.location.href = 'login.html';
            return;
        }

        const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        if (user.username === getCurrentUser().username) { // Check if it's "my" message
            messageElement.classList.add('my-message');
        }

        messageElement.innerHTML = `
            <img src="${user.avatar || 'assets/images/default-avatar.png'}" alt="Avatar" class="avatar">
            <div class="message-content">
                <strong>${user.username}</strong>
                <p>${messageText}</p>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;
        chatArea.prepend(messageElement); // Add to top to maintain reverse order

        chatInput.value = ''; // Clear input
        chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom (will effectively be top due to flex-direction-reverse)

        playSound('new-message-sound'); // Play sound for new message

        // Simulate adding XP for sending messages
        addXP(5); // Assuming addXP function exists in user.js and is globally available
    }

    // Function to display system messages
    window.displaySystemMessage = function(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'system-message');
        messageElement.innerHTML = `<p>${message}</p>`;
        chatArea.prepend(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight;
    };

    // Update room user list display
    function updateRoomUsersDisplay(users) {
        if (!roomUsersList) return;
        roomUsersList.innerHTML = ''; // Clear current list
        userCountSpan.textContent = users.length;

        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.classList.add('user-item');
            userItem.innerHTML = `
                <img src="${user.avatar || 'assets/images/default-avatar.png'}" alt="User Avatar">
                <div class="user-info">
                    <span class="username">${user.username}</span>
                    <span class="rank">${user.rank}</span>
                </div>
            `;
            roomUsersList.appendChild(userItem);
        });
    }
});
