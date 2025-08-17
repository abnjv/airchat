// main.js
// هذا الملف يحتوي على الوظائف العامة التي قد تستخدمها جميع الصفحات أو لتهيئة التطبيق

document.addEventListener('DOMContentLoaded', () => {
    console.log('Main JavaScript loaded.');

    // === Global Utility Functions ===

    /**
     * Helper function to select an element
     * @param {string} selector - CSS selector string
     * @returns {HTMLElement|null} The selected element or null
     */
    window.getElement = (selector) => {
        return document.querySelector(selector);
    };

    /**
     * Helper function to select all elements
     * @param {string} selector - CSS selector string
     * @returns {NodeListOf<HTMLElement>} A NodeList of selected elements
     */
    window.getAllElements = (selector) => {
        return document.querySelectorAll(selector);
    };

    /**
     * Shows a message temporarily in a designated message area.
     * @param {string} message - The message to display.
     * @param {string} type - 'info', 'success', 'error'.
     * @param {HTMLElement} targetElement - The element where the message should be displayed.
     * @param {number} duration - How long to display the message in milliseconds.
     */
    window.displayMessage = (message, type, targetElement, duration = 3000) => {
        if (!targetElement) {
            console.warn("Target element for message display not found.");
            return;
        }

        targetElement.textContent = message;
        targetElement.className = `message-info message-${type}`; // Resets classes
        targetElement.classList.remove('hidden');

        setTimeout(() => {
            targetElement.classList.add('hidden');
        }, duration);
    };

    // === Login/Register Page Logic (basic toggle) ===
    const showRegisterLink = getElement('#show-register');
    const showLoginLink = getElement('#show-login');
    const loginForm = getElement('#login-form');
    const registerForm = getElement('#register-form');

    if (showRegisterLink && showLoginLink && loginForm && registerForm) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // === Room Page - Basic Timer (for demo, replace with server-synced time) ===
    const roomDurationElement = getElement('#room-duration');
    if (roomDurationElement) {
        let seconds = 0;
        let minutes = 0;
        let hours = 0;

        setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }
            const formattedTime = [hours, minutes, seconds]
                .map(unit => unit < 10 ? '0' + unit : unit)
                .join(':');
            roomDurationElement.textContent = formattedTime;
        }, 1000);
    }

    // === Leave Room Button ===
    const leaveRoomBtn = getElement('#leave-room-btn');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            // In a real application, this would send a request to the server
            // to leave the room, clean up resources, etc.
            alert('تمت مغادرة الغرفة. سيتم نقلك إلى صفحة الغرف المتاحة.');
            window.location.href = 'rooms.html'; // Redirect to rooms page
        });
    }

    // === Example for dynamic user list in room.html (replace with actual data from server) ===
    const userListElement = getElement('#user-list');
    if (userListElement) {
        const dummyUsers = [
            { name: 'محمد', avatar: 'default-avatar.png', isOnline: true, hasMic: true, rank: 'VIP' },
            { name: 'فاطمة', avatar: 'default-avatar.png', isOnline: true, hasMic: false, rank: 'عضو' },
            { name: 'أحمد', avatar: 'default-avatar.png', isOnline: true, hasMic: true, rank: 'مشرف' },
            { name: 'ليلى', avatar: 'default-avatar.png', isOnline: true, hasMic: false, rank: 'عضو' },
            { name: 'علي', avatar: 'default-avatar.png', isOnline: false, hasMic: false, rank: 'عضو' }
        ];

        function renderUserList() {
            userListElement.innerHTML = ''; // Clear existing list
            dummyUsers.forEach(user => {
                const li = document.createElement('li');
                li.classList.add('user-item');
                if (!user.isOnline) {
                    li.classList.add('offline');
                }
                // Add an event listener for user item click (e.g., to show user profile/options)
                li.addEventListener('click', () => {
                    alert(`تم النقر على المستخدم: ${user.name}`);
                    // Implement user profile pop-up or admin actions here
                });

                li.innerHTML = `
                    <img src="assets/images/${user.avatar}" alt="${user.name} Avatar" class="user-avatar">
                    <span class="user-name">${user.name}</span>
                    <span class="user-status ${user.isOnline ? 'online' : 'offline'}"></span>
                    <i class="fas fa-microphone user-mic-status ${user.hasMic ? 'active' : ''}"></i>
                    <span class="user-rank">(${user.rank})</span>
                `;
                userListElement.appendChild(li);
            });
            // Update online users count
            const onlineCountElement = getElement('#online-users-count');
            if(onlineCountElement){
                onlineCountElement.textContent = dummyUsers.filter(u => u.isOnline).length;
            }
        }
        renderUserList(); // Initial render
    }
});

// هذا الكود يمكن أن يحتوي على دوال مساعدة عامة أخرى، مثل
// التعامل مع الـ AJAX requests (fetch API)
// أو وظائف تهيئة لواجهات المستخدم في صفحات متعددة.
