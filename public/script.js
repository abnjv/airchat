const socket = io();
let localStream;
let peers = {};
let username = '';

// عند الدخول للغرفة
document.getElementById('joinBtn').onclick = async () => {
  const name = document.getElementById('username').value.trim();
  if (!name) return alert('📝 أدخل اسمك أولاً');

  username = name;
  document.getElementById('login').style.display = 'none';
  document.getElementById('room').style.display = 'block';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    alert('🚫 الرجاء السماح بالوصول إلى المايكروفون');
    return;
  }

  socket.emit('join', username);
};

// زر الخروج
document.getElementById('leaveBtn').onclick = () => {
  socket.emit('leave', username);
  location.reload();
};

// تحديث الدوائر داخل الغرفة
socket.on('update-users', users => {
  const container = document.getElementById('users');
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const user = users[i];
    const mic = document.createElement('div');
    mic.className = 'mic-circle';

    if (user) {
      mic.innerHTML = `
        <img src="avatar.jpg" width="48" height="48" style="border-radius:50%;">
        <div class="username">${user}</div>
        <div class="menu">
          <button onclick="muteUser('${user}')">🔇 كتم الصوت</button>
          <button onclick="disableMic('${user}')">🎙️ قفل المايك</button>
          <button onclick="inviteUser('${user}')">📩 دعوة</button>
        </div>
      `;
    } else {
      mic.innerHTML = `<div class="username">فارغ</div>`;
    }

    mic.onclick = () => {
      const menu = mic.querySelector('.menu');
      if (menu) menu.style.display = (menu.style.display === 'flex' ? 'none' : 'flex');
    };

    container.appendChild(mic);
  }
});

// WebRTC - استقبال العروض
socket.on('offer', async (id, description) => {
  const pc = createPeer(id);
  await pc.setRemoteDescription(description);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', id, pc.localDescription);
});

socket.on('answer', (id, description) => {
  peers[id]?.setRemoteDescription(description);
});

socket.on('ice-candidate', (id, candidate) => {
  peers[id]?.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('user-connected', async id => {
  const pc = createPeer(id);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', id, pc.localDescription);
});

socket.on('user-disconnected', id => {
  if (peers[id]) {
    peers[id].close();
    delete peers[id];
  }
});

// إنشاء Peer
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

// تحكم المايك (وهمية الآن - سيتم تطويرها لاحقاً)
function muteUser(name) {
  alert(`🔇 تم كتم صوت ${name}`);
}

function disableMic(name) {
  alert(`🎙️ تم إغلاق مايك ${name}`);
}

function inviteUser(name) {
  alert(`📩 تم إرسال دعوة إلى ${name}`);
}
