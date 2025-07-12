// user.js
// هذا الملف يتعامل مع منطق المستخدم، التسجيل/الدخول، إدارة الصلاحيات، المايكات، الـ XP، إلخ.

document.addEventListener('DOMContentLoaded', () => {
    console.log('User JavaScript loaded.');

    const loginForm = getElement('#login-form');
    const registerForm = getElement('#register-form');
    const authMessage = getElement('#auth-message'); // Element to display login/register messages

    // === User Authentication (Login/Register) ===
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = getElement('#username').value;
            const password = getElement('#password').value;

            // In a real application, this would send data to a backend server for authentication.
            // For this static demo, we'll simulate a successful login.
            if (username === 'testuser' && password === 'password') {
                displayMessage('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success', authMessage);
                // Simulate setting a user token/session in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    role: 'member', // Default role
                    level: 1,
                    xp: 0,
                    coins: 1000
                }));
                setTimeout(() => {
                    window.location.href = 'room.html'; // Redirect to room page after successful login
                }, 1500);
            } else {
                displayMessage('اسم المستخدم أو كلمة المرور غير صحيحة.', 'error', authMessage);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const regUsername = getElement('#reg-username').value;
            const regPassword = getElement('#reg-password').value;
            const regConfirmPassword = getElement('#reg-confirm-password').value;

            if (regPassword !== regConfirmPassword) {
                displayMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقين.', 'error', authMessage);
                return;
            }
            if (regPassword.length < 6) {
                displayMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل.', 'error', authMessage);
                return;
            }

            // In a real application, this would send data to a backend server for registration.
            // For this static demo, we'll simulate a successful registration.
            displayMessage('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.', 'success', authMessage);
            registerForm.reset(); // Clear form
            setTimeout(() => {
                getElement('#register-form').classList.add('hidden');
                getElement('#login-form').classList.remove('hidden');
            }, 1500);
        });
    }

    // === User Interface Updates in Room Page ===
    const userLevelElement = getElement('#user-level');
    const userXpElement = getElement('#user-xp');
    const xpProgressBar = getElement('#xp-progress-bar');
    const userCoinsElement = getElement('#user-coins');
    const adminControls = getAllElements('.admin-only'); // Elements only for admin/moderator

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function updateUserInfoUI() {
        if (currentUser) {
            if (userLevelElement) userLevelElement.textContent = `المستوى: ${currentUser.level}`;
            if (userXpElement) userXpElement.textContent = `XP: ${currentUser.xp}/${currentUser.level * 100}`; // Example XP needed for next level
            if (xpProgressBar) {
                const progress = (currentUser.xp / (currentUser.level * 100)) * 100;
                xpProgressBar.style.width = `${progress}%`;
            }
            if (userCoinsElement) userCoinsElement.textContent = currentUser.coins;

            // Show/hide admin controls based on user role
            if (adminControls.length > 0) {
                if (currentUser.role === 'admin' || currentUser.role === 'moderator') {
                    adminControls.forEach(el => el.style.display = 'flex'); // Or 'block', depending on CSS
                } else {
                    adminControls.forEach(el => el.style.display = 'none');
                }
            }
        } else {
            // If no user is logged in, hide user info or redirect to login
            console.log('No user logged in. Redirecting to login or showing guest options.');
            // For a real app: window.location.href = 'login.html';
        }
    }

    // Call this function initially to set up user UI
    updateUserInfoUI();

    // === Mic Controls (Basic Simulation) ===
    const micUpBtn = getElement('#mic-up-btn');
    const micDownBtn = getElement('#mic-down-btn');
    const muteAllBtn = getElement('#mute-all-btn');
    const unmuteAllBtn = getElement('#unmute-all-btn');
    const kickUserBtn = getElement('#kick-user-btn');
    const banUserBtn = getElement('#ban-user-btn');

    if (micUpBtn) {
        micUpBtn.addEventListener('click', () => {
            if (currentUser) {
                // Simulate request to server to get mic
                displayMessage('طلب صعود المايك قيد المعالجة...', 'info', getElement('#chat-area .messages-container'));
                // In real app, server would respond with success/failure
                // For demo: Assume success
                // currentUser.hasMic = true; // This would be updated by server response
                // updateUserInfoUI(); // Update UI if user mic status changes
            } else {
                displayMessage('يجب تسجيل الدخول لطلب المايك.', 'error', getElement('#chat-area .messages-container'));
            }
        });
    }

    if (micDownBtn) {
        micDownBtn.addEventListener('click', () => {
            if (currentUser && currentUser.hasMic) {
                // Simulate request to server to release mic
                displayMessage('تم النزول من المايك.', 'info', getElement('#chat-area .messages-container'));
                // currentUser.hasMic = false;
                // updateUserInfoUI();
            } else {
                displayMessage('أنت لست على المايك.', 'warning', getElement('#chat-area .messages-container'));
            }
        });
    }

    // Admin/Moderator Controls
    if (muteAllBtn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
        muteAllBtn.addEventListener('click', () => {
            // Send request to server to mute all users
            displayMessage('تم كتم صوت جميع المستخدمين.', 'info', getElement('#chat-area .messages-container'));
        });
    }

    if (unmuteAllBtn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
        unmuteAllBtn.addEventListener('click', () => {
            // Send request to server to unmute all users
            displayMessage('تم فتح كتم صوت جميع المستخدمين.', 'info', getElement('#chat-area .messages-container'));
        });
    }

    if (kickUserBtn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
        kickUserBtn.addEventListener('click', () => {
            const userIdToKick = prompt('أدخل اسم المستخدم أو معرّف المستخدم لطرده:');
            if (userIdToKick) {
                // Send request to server to kick user
                displayMessage(`تم طلب طرد المستخدم: ${userIdToKick}`, 'info', getElement('#chat-area .messages-container'));
            }
        });
    }

    if (banUserBtn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
        banUserBtn.addEventListener('click', () => {
            const userIdToBan = prompt('أدخل اسم المستخدم أو معرّف المستخدم لحظره:');
            if (userIdToBan) {
                // Send request to server to ban user
                displayMessage(`تم طلب حظر المستخدم: ${userIdToBan}`, 'info', getElement('#chat-area .messages-container'));
            }
        });
    }
});

// Function to update user's coins (can be called from gift.js or other modules)
function updateUserCoins(amount) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.coins += amount;
        if (currentUser.coins < 0) currentUser.coins = 0; // Prevent negative coins
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Update UI
        const userCoinsElement = getElement('#user-coins');
        if (userCoinsElement) userCoinsElement.textContent = currentUser.coins;
    }
}

// Function to update user's XP
function updateUserXP(amount) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.xp += amount;
        // Check for level up (example logic)
        const xpNeededForNextLevel = currentUser.level * 100;
        if (currentUser.xp >= xpNeededForNextLevel) {
            currentUser.level++;
            currentUser.xp = currentUser.xp - xpNeededForNextLevel; // Carry over excess XP
            displayMessage(`تهانينا! لقد وصلت إلى المستوى ${currentUser.level}!`, 'success', getElement('#chat-area .messages-container'));
            playSound('level-up-sound.mp3'); // Assuming you have a level up sound
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Update UI
        const userLevelElement = getElement('#user-level');
        const userXpElement = getElement('#user-xp');
        const xpProgressBar = getElement('#xp-progress-bar');

        if (userLevelElement) userLevelElement.textContent = `المستوى: ${currentUser.level}`;
        if (userXpElement) userXpElement.textContent = `XP: ${currentUser.xp}/${currentUser.level * 100}`;
        if (xpProgressBar) {
            const progress = (currentUser.xp / (currentUser.level * 100)) * 100;
            xpProgressBar.style.width = `${progress}%`;
        }
    }
}
