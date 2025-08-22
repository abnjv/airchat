export function saveSession(state, data) {
    state.currentUser = { _id: data._id, username: data.username, profilePicture: data.profilePicture };
    state.token = data.token;
    localStorage.setItem('airchat_session', JSON.stringify({ currentUser: state.currentUser, token: state.token }));
}

export function loadSession(state) {
    const session = localStorage.getItem('airchat_session');
    if (!session) return false;
    const { currentUser, token } = JSON.parse(session);
    state.currentUser = currentUser;
    state.token = token;
    return true;
}
