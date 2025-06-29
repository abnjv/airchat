const socket = io();

// تسجيل الدخول
const form = document.getElementById('join-form');
const input = document.getElementById('username');

if (form && input) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = input.value.trim();
    if (username) {
      socket.emit('join', username);
      window.location.href = `/chat.html?name=${encodeURIComponent(username)}`;
    }
  });
}

// WebRTC الصوتي
let localStream;
let peerConnection;
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// عند الدخول إلى صفحة الدردشة
if (window.location.pathname.includes('chat.html')) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    localStream = stream;

    socket.on('offer', async (id, description) => {
      peerConnection = new RTCPeerConnection(config);
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

      await peerConnection.setRemoteDescription(description);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', id, peerConnection.localDescription);

      peerConnection.ontrack = (event) => {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        document.body.appendChild(audio);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', id, event.candidate);
        }
      };
    });

    socket.on('candidate', (id, candidate) => {
      peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('connect', () => {
      peerConnection = new RTCPeerConnection(config);
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', socket.id, event.candidate);
        }
      };

      peerConnection.ontrack = (event) => {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.srcObject = event.streams[0];
        document.body.appendChild(audio);
      };

      peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        socket.emit('offer', socket.id, offer);
      });
    });
  });
}
