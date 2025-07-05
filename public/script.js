const socket = io();
let localStream;
let peers = {};
let username = '';
let userId = generateID();

// عند الضغط على زر دخول الغرفة
document.getElementById('joinBtn').onclick = async () => {
  const input = document.getElementById('username');
  const name = input.value.trim();
  if (!name) return alert('يرجى كتابة اسمك أولاً');
  username = name;

  // حفظ الاسم
  localStorage.setItem("username", username);
  localStorage.setItem("userId", userId);

  // عرض الواجهة
  document.getElementById('login').style.display = 'none';
  document.getElementById('room').style.display = 'block';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    alert('🚫 الرجاء السماح بالوصول إلى الميكروفون');
    return;
  }

  socket.emit('join', { name: username, id: userId });
};

// زر الخروج
document.getElementById('leaveBtn').onclick = () => {
  socket.emit('leave', { name: username, id: userId });
  location.reload();
};

// تحديث المستخدمين
socket.on('update-users', users => {
  const ul = document.getElementById('users');
  ul.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="avatar.jpg" width="32" height="32" style="border-radius:50%; vertical-align:middle; margin-left:10px; cursor:pointer;" onclick="showUserPopup('${user.name}', '${user.id}')">
      <span>${user.name}</span>
    `;
    ul.appendChild(li);
  });
});

// صوت الاتصال
const audioJoin = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_43a409b6f3.mp3');

// عند الاتصال
socket.on('user-connected', async id => {
  audioJoin.play();
  const pc = createPeer(id);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', id, pc.localDescription);
});

// قطع الاتصال
socket.on('user-disconnected', id => {
  if (peers[id]) {
    peers[id].close();
    delete peers[id];
  }
});

// WebRTC
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

// توليد ID عشوائي
function generateID() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

// عرض نافذة بيانات المستخدم
function showUserPopup(name, id) {
  alert(`👤 الاسم: ${name}\n🆔 المعرف: ${id}\n🎁 لإرسال هدية اضغط OK`);
}
