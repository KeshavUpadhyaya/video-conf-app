const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
});

const connStringPara = document.createElement('p');
connStringPara.innerHTML = 'connection string = localhost:3000/' + ROOM_ID;
document.body.append(connStringPara);

const myVideo = document.createElement('video');
const peers = {};
// muting your own mic
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on('user-disconnected', (userId) => {
  // console.log(userId);
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

// socket.on('user-connected', (userId) => {
//   console.log('user connected: ' + userId);
// });

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}
