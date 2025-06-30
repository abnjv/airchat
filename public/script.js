const socket = io();
let localStream;
let peerConnections = {};
let username = '';

// عند الضغط على زر دخول الغرفة
document.getElementById('joinBtn').onclick = () => {
  const nameInput = document.getElementById('username').value.trim();
  if (nameInput) {
    username = nameInput;
    socket.emit('join', username);
    document.getElementById('login').style.display = 'none';
    document.getElementById('room').style.display = 'block';
  } else {
    alert('يرجى كتابة اسمك أولاً');
  }
};

// زر الخروج
document.getElementById('leaveBtn').onclick = () => {
  socket.emit('leave', username);
  location.reload();
};

// تحديث قائمة المستخدمين
socket.on('update-users', users => {
  const ul = document.getElementById('users');
  ul.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    ul.appendChild(li);
  });
});

// طلب الميكروفون
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;
  })
  .catch(err => {
    alert('🚫 الرجاء السماح بالوصول إلى الميكروفون');
    console.error(err);
  });

// استلام عرض من مستخدم جديد
socket.on('offer', (id, description) => {
  const pc = createPeerConnection(id);
  peerConnections[id] = pc;

  pc.setRemoteDescription(description).then(() => {
    return pc.createAnswer();
  }).then(answer => {
    return pc.setLocalDescription(answer);
  }).then(() => {
    socket.emit('answer', id, pc.localDescription);
  });
});

// استلام الجواب من الطرف الآخر
socket.on('answer', (id, description) => {
  if (peerConnections[id]) {
    peerConnections[id].setRemoteDescription(description);
  }
});

// استلام مرشح ICE
socket.on('candidate', (id, candidate) => {
  if (peerConnections[id]) {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  }
});

// مستخدم جديد انضم
socket.on('new-user', id => {
  const pc = createPeerConnection(id);
  peerConnections[id] = pc;

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.createOffer().then(offer => {
    return pc.setLocalDescription(offer);
  }).then(() => {
    socket.emit('offer', id, pc.localDescription);
  });
});

// مستخدم خرج
socket.on('user-left', id => {
  if (peerConnections[id]) {
    peerConnections[id].close();
    delete peerConnections[id];
  }
});

// إنشاء الاتصال
function createPeerConnection(id) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('candidate', id, event.candidate);
    }
  };

  pc.ontrack = event => {
    const audio = document.createElement('audio');
    audio.srcObject = event.streams[0];
    audio.autoplay = true;
    document.body.appendChild(audio);
  };

  return pc;
}
