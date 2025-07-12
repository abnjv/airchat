document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const registerSection = document.getElementById('register-section');

    // Dummy user storage for demonstration (in a real app, this would be a backend database)
    let users = JSON.parse(localStorage.getItem('appUsers')) || [
        { username: 'testuser', password: 'password', avatar: 'assets/images/default-avatar.png', level: 1, xp: 0, rank: 'عضو جديد', coins: 1000, giftsSent: 0, giftsReceived: 0 },
        { username: 'admin', password: 'admin', avatar: 'assets/images/default-avatar.png', level: 5, xp: 5000, rank: 'مشرف', coins: 5000, giftsSent: 10, giftsReceived: 25 }
    ];
    localStorage.setItem('appUsers', JSON.stringify(users)); // Ensure dummy users are set

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                loginError.textContent = '';
                alert('تم تسجيل الدخول بنجاح!');
                window.location.href = 'rooms.html'; // Redirect to rooms page
            } else {
                loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
            }
        });
    }

    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerSection) {
                registerSection.style.display = 'block';
                loginForm.style.display = 'none'; // Hide login form
                showRegisterFormBtn.style.display = 'none'; // Hide link
                loginError.textContent = ''; // Clear login errors
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm['reg-username'].value;
            const password = registerForm['reg-password'].value;

            if (users.some(u => u.username === username)) {
                registerError.textContent = 'اسم المستخدم هذا موجود بالفعل. الرجاء اختيار اسم آخر.';
            } else {
                const newUser = {
                    username: username,
                    password: password,
                    avatar: 'assets/images/default-avatar.png',
                    level: 1,
                    xp: 0,
                    rank: 'عضو جديد',
                    coins: 500, // Starting coins for new users
                    giftsSent: 0,
                    giftsReceived: 0
                };
                users.push(newUser);
                localStorage.setItem('appUsers', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                registerError.textContent = '';
                alert('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
                window.location.href = 'rooms.html'; // Redirect to rooms page
            }
        });
    }
});

// Function to get current user (used across different JS files)
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Function to update current user data (used across different JS files)
function updateCurrentUser(updatedUserData) {
    let currentUser = getCurrentUser();
    if (currentUser) {
        // Merge updated data with existing user data
        currentUser = { ...currentUser, ...updatedUserData };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Also update the user in the main appUsers array
        let users = JSON.parse(localStorage.getItem('appUsers')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('appUsers', JSON.stringify(users));
        }

        // Update footer info immediately if visible
        if (document.getElementById('footer-username')) {
            updateUserFooterInfo(currentUser);
        }
    }
}

// Function to add XP (for demonstration)
function addXP(amount) {
    let user = getCurrentUser();
    if (user) {
        user.xp = (user.xp || 0) + amount;
        // Simple level up logic (can be more complex)
        const newLevel = Math.floor(Math.sqrt(user.xp / 100) + 1); // Example formula
        if (newLevel > user.level) {
            user.level = newLevel;
            playSound('level-up-sound');
            displaySystemMessage(` تهانينا! لقد وصلت إلى المستوى ${user.level}!`);
        }
        updateCurrentUser(user);
    }
}
