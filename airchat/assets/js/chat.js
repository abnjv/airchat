// chat.js
// هذا الملف يتعامل مع منطق الدردشة، إرسال واستقبال الرسائل.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat JavaScript loaded.');

    const messageInput = getElement('#message-input');
    const sendMessageBtn = getElement('#send-message-btn');
    const messagesContainer = getElement('#messages-container');

    // Simple message filter (example)
    const profanityList = ['كلمة1', 'كلمة2', 'كلمة3']; // Add actual forbidden words

    function filterMessage(message) {
        let filteredMessage = message;
        profanityList.forEach(word => {
            const regex = new RegExp(word, 'gi'); // Case-insensitive, global
            filteredMessage = filteredMessage.replace(regex, '***'); // Replace with asterisks
        });
        return filteredMessage;
    }

    function appendMessage(sender, messageText, type = 'received') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = `${sender}:`;

        const textSpan = document.createElement('span');
        textSpan.classList.add('message-text');
        textSpan.textContent = filterMessage(messageText); // Apply filter

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        messageElement.appendChild(senderSpan);
        messageElement.appendChild(textSpan);
        messageElement.appendChild(timeSpan);
        messagesContainer.appendChild(messageElement);

        // Scroll to the bottom of the chat
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Simulate receiving a message (e.g., from a WebSocket server)
    function simulateReceivedMessage(sender, messageText) {
        setTimeout(() => {
            appendMessage(sender, messageText, 'received');
            playSound('new-message.mp3'); // Play sound for new message
        }, 1000);
    }

    // Send Message Logic
    if (sendMessageBtn && messageInput && messagesContainer) {
        sendMessageBtn.addEventListener('click', () => {
            const messageText = messageInput.value.trim();
            if (messageText) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const senderName = currentUser ? currentUser.username : 'ضيف';
                appendMessage(senderName, messageText, 'sent');
                messageInput.value = ''; // Clear input

                // In a real application, send message to server via WebSocket/AJAX
                // Example: socket.send(JSON.stringify({ type: 'chatMessage', sender: senderName, message: messageText }));

                // Simulate bot reply or another user's message
                if (messageText.toLowerCase().includes('مرحبا')) {
                    simulateReceivedMessage('بوت AirChat', 'أهلاً بك في AirChat! كيف يمكنني مساعدتك؟');
                } else if (messageText.toLowerCase().includes('كيف الحال')) {
                     simulateReceivedMessage('بوت AirChat', 'أنا بخير، شكراً لسؤالك!');
                }
                updateUserXP(5); // Grant XP for sending a message
            }
        });

        // Allow sending message with Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessageBtn.click();
            }
        });
    }

    // Initial welcome message (simulated)
    if (messagesContainer) {
        setTimeout(() => {
            appendMessage('بوت AirChat', 'أهلاً بك في غرفة الدردشة! استمتع بوقتك.', 'received');
            playSound('welcome.mp3');
        }, 500);
    }

    // Example for updating top XP users (replace with real-time data from server)
    const topXpUsersList = getElement('#top-xp-users');
    if (topXpUsersList) {
        const dummyTopUsers = [
            { name: 'الملك', xp: 5000 },
            { name: 'الزعيم', xp: 4500 },
            { name: 'ماريو', xp: 3000 }
        ];

        function renderTopXpUsers() {
            topXpUsersList.innerHTML = '';
            dummyTopUsers.sort((a, b) => b.xp - a.xp).forEach((user, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="xp-rank">${index + 1}.</span> ${user.name} - ${user.xp} XP`;
                topXpUsersList.appendChild(li);
            });
        }
        renderTopXpUsers(); // Initial render
    }
});
