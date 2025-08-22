import { saveSession } from './session.js';
import { showScreen, showMessage } from './ui.js';
import { elements } from './main.js'; // Import elements for potential use

export async function loginUser(username, password) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        saveSession(data);
        showScreen('rooms-screen');
    } catch (error) {
        showMessage(`Login Failed: ${error.message}`, true);
        console.error('Login failed:', error);
    }
}

export async function signupUser(username, password) {
    // ... similar to loginUser
}

// ... all other API functions
