document.addEventListener('DOMContentLoaded', () => {
    const roomsList = document.getElementById('rooms-list');
    const createRoomForm = document.getElementById('create-room-form');
    const roomsMessage = document.getElementById('rooms-message');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    const currentUser = getCurrentUser();
    const token = getToken();

    // 1. Check for user and token
    if (!currentUser || !token) {
        window.location.href = 'login.html';
        return; // Stop script execution
    }

    // Display welcome message
    if (welcomeMessage) {
        welcomeMessage.textContent = `مرحباً بك، ${currentUser.username}!`;
    }

    // 2. Fetch and render rooms
    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            if (!res.ok) throw new Error('Failed to fetch rooms');

            const rooms = await res.json();
            roomsList.innerHTML = ''; // Clear list

            if (rooms.length === 0) {
                roomsList.innerHTML = '<p>لا توجد غرف متاحة حالياً. قم بإنشاء واحدة!</p>';
                return;
            }

            rooms.forEach(room => {
                const roomElement = document.createElement('div');
                roomElement.className = 'room-card';
                roomElement.innerHTML = `
                    <h3>${room.name}</h3>
                    <p>المشاركون: ${room.participants.length}</p>
                    <button class="btn join-btn" data-room-id="${room._id}">انضمام</button>
                `;
                roomsList.appendChild(roomElement);
            });

        } catch (error) {
            roomsMessage.textContent = error.message;
            roomsMessage.className = 'message-info message-error';
        }
    };

    // 3. Handle Create Room form submission
    if (createRoomForm) {
        createRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const roomName = document.getElementById('room-name').value;
            if (!roomName) return;

            try {
                const res = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: roomName }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to create room');
                }

                // Refresh the rooms list
                fetchRooms();
                createRoomForm.reset(); // Clear the form

            } catch (error) {
                roomsMessage.textContent = error.message;
                roomsMessage.className = 'message-info message-error';
            }
        });
    }

    // 4. Handle Join Room button click
    roomsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('join-btn')) {
            const roomId = e.target.dataset.roomId;
            // For now, we'll just store the selected room and redirect.
            // A more complex app would handle joining logic with the backend.
            localStorage.setItem('currentRoomId', roomId);
            window.location.href = `room.html?id=${roomId}`;
        }
    });

    // 5. Handle Logout
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout(); // This function is in user.js
        });
    }

    // Initial fetch of rooms
    fetchRooms();
});
