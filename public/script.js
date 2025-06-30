const socket = io();
let localStream;
let peers = {};
let username = '';

document.getElementById('joinBtn').onclick = async () => {
  const nameInput = document.getElementById('username').value.trim();
  if (!nameInput) return alert('يرجى كتابة اسمك أولاً');
  username = nameInput;

  document.getElementById('login').style.display = 'none';
  document.getElementById('room').style.display = 'block';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    alert('🚫 الرجاء السماح بالوصول إلى الميكروفون');
    return;
  }

  socket.emit('join', username);
};

document.getElementById('leaveBtn').onclick = () => {
  socket.emit('leave', username);
  location.reload();
};

// تحديث المستخدمين في شكل دوائر
socket.on('update-users', users => {
  const container = document.getElementById('users');
  container.innerHTML = '';

  users.forEach(user => {
    const mic = document.createElement('div');
    mic.className = 'mic-circle';
    mic.innerHTML = `
      <img src="avatar.jpg" width="48" height="48" style="border-radius:50%;">
      <div class="username">${user}</div>
    `;
    container.appendChild(mic);
  });
});

// استقبال عرض
socket.on('offer', async (id, description) => {
  const pc = createPeer(id);
  await pc.setRemoteDescription(description);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', id, pc.localDescription);
});

// استقبال جواب
socket.on('answer', (id, description) => {
  peers[id]?.setRemoteDescription(description);
});

// استقبال مرشح ICE
socket.on('ice-candidate', (id, candidate) => {
  peers[id]?.addIceCandidate(new RTCIceCandidate(candidate));
});

// مستخدم جديد
socket.on('user-connected', async id => {
  const pc = createPeer(id);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', id, pc.localDescription);
});

// خروج مستخدم
socket.on('user-disconnected', id => {
  if (peers[id]) {
    peers[id].close();
    delete peers[id];
  }
});

// إنشاء PeerConnection
function createPeer(id) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('ice-candidate', id, event.candidate);
    }
  };

  pc.ontrack = event => {
    const audio = document.createElement('audio');
    audio.srcObject = event.streams[0];
    audio.autoplay = true;
    document.body.appendChild(audio);
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  peers[id] = pc;
  return pc;
}
