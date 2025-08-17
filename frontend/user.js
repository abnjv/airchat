document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message');

    // Function to display messages to the user
    const showMessage = (message, isError = false) => {
        authMessage.textContent = message;
        authMessage.className = isError ? 'message-info message-error' : 'message-info message-success';
    };

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm['reg-username'].value;
            const password = registerForm['reg-password'].value;
            const confirmPassword = registerForm['reg-confirm-password'].value;

            if (password !== confirmPassword) {
                showMessage('كلمتا المرور غير متطابقتين!', true);
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }), // Assuming email is not required for now based on form
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'فشل التسجيل');
                }

                showMessage('تم التسجيل بنجاح! جاري تسجيل الدخول...', false);
                // Store user info and token
                localStorage.setItem('currentUser', JSON.stringify(data));
                localStorage.setItem('token', data.token);

                // Redirect to rooms page after a short delay
                setTimeout(() => {
                    window.location.href = 'rooms.html';
                }, 1500);

            } catch (err) {
                showMessage(err.message, true);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value; // Using username for login
            const password = loginForm.password.value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }), // Changed to username
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'فشل تسجيل الدخول');
                }

                showMessage('تم تسجيل الدخول بنجاح! جاري التوجيه...', false);
                // Store user info and token
                localStorage.setItem('currentUser', JSON.stringify(data));
                localStorage.setItem('token', data.token);

                // Redirect to rooms page
                setTimeout(() => {
                    window.location.href = 'rooms.html';
                }, 1500);

            } catch (err) {
                showMessage(err.message, true);
            }
        });
    }
});

// Global helper functions
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getToken() {
    return localStorage.getItem('token');
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
