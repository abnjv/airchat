document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatArea = document.getElementById('chat-area');
    const roomNameHeader = document.getElementById('room-name-header');

    // --- 1. Initialization ---
    const currentUser = getCurrentUser();
    const token = getToken();

    // Get room ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!currentUser || !token || !roomId) {
        alert('خطأ! لم يتم العثور على معلومات المستخدم أو الغرفة. سيتم إعادتك لتسجيل الدخول.');
        window.location.href = 'login.html';
        return;
    }

    // --- 2. Socket.IO Connection ---
    const socket = io(); // Connect to the server

    // --- 3. Joining a Room ---
    socket.on('connect', () => {
        console.log('Connected to Socket.IO server!');
        // Join the specific room
        socket.emit('joinRoom', { username: currentUser.username, room: roomId });
    });

    // --- 4. Sending Messages ---
    const sendMessage = () => {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        const messagePayload = {
            room: roomId,
            message: {
                text: messageText,
                username: currentUser.username,
                // avatar: currentUser.avatar // Can be added later
            }
        };

        // Emit message to the server
        socket.emit('chatMessage', messagePayload);

        // Clear input field
        chatInput.value = '';
    };

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // --- 5. Receiving Messages ---
    socket.on('message', (message) => {
        displayMessage(message);
    });

    const displayMessage = (msg) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');

        let messageContent;

        if (typeof msg === 'object') {
            // It's a user chat message
            if (msg.username === currentUser.username) {
                messageElement.classList.add('my-message');
            }
            messageContent = `
                <div class="message-content">
                    <strong>${msg.username}</strong>
                    <p>${msg.text}</p>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
        } else {
            // It's a system message (e.g., 'user has joined')
            messageElement.classList.add('system-message');
            messageContent = `<p>${msg}</p>`;
        }

        messageElement.innerHTML = messageContent;
        chatArea.appendChild(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to the latest message
    };

    // --- 6. Fetch Room Details (e.g., name) ---
    const fetchRoomDetails = async () => {
        try {
            const res = await fetch(`/api/rooms/${roomId}`);
            if (!res.ok) throw new Error('Could not fetch room details');
            const room = await res.json();
            if (roomNameHeader) {
                roomNameHeader.textContent = room.name;
            }
        } catch (error) {
            console.error(error);
            if (roomNameHeader) {
                roomNameHeader.textContent = 'غرفة غير معروفة';
            }
        }
    };

    fetchRoomDetails();
});
