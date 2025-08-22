import * as ui from './ui.js';
import * as api from './api.js';
import { connectSocket } from './socket.js';
import { loadSession } from './session.js';

export const elements = { /* ... */ };
export let state = { /* ... */ };

function setupEventListeners() {
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        api.loginUser(
            elements.loginForm.elements['login-username'].value,
            elements.loginForm.elements['login-password'].value
        );
    });
    // ...
}

function init() {
    if (loadSession(state)) {
        ui.showScreen('rooms-screen', elements, state);
    } else {
        ui.showScreen('home-screen', elements, state);
    }
    setupEventListeners();
}

init();
