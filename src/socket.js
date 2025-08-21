import { addRoomToList } from './ui.js';
import { appendMessage, renderParticipants } from './ui.js';

export function connectSocket(state, rtcHandler) {
    if (state.socket || !state.token) return;
    const socket = io({ auth: { token: state.token } });

    socket.on('connect', () => {
        if (state.currentUser) socket.emit('register-socket', state.currentUser._id);
    });

    socket.on('room_created', addRoomToList);
    socket.on('message', message => {
        if (message.sender._id !== state.currentUser._id) appendMessage(message, state);
    });
    socket.on('update_participants', participants => renderParticipants(participants, state));

    // WebRTC Listeners
    socket.on('voice-offer', data => rtcHandler && rtcHandler.handleOffer(data));
    socket.on('voice-answer', async data => rtcHandler && await rtcHandler.handleAnswer(data));
    socket.on('ice-candidate', async data => rtcHandler && await rtcHandler.handleCandidate(data));
    socket.on('hang-up', () => rtcHandler && rtcHandler.hangUp());

    socket.on('disconnect', () => { state.socket = null; });

    return socket;
}
