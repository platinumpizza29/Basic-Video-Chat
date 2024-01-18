const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  /**
   * Handle incoming peer connections and disconnections.
   *
   * Get the local video stream, add it to the page, and answer any incoming calls,
   * adding the remote video stream to the page.
   * Listen for user connected and disconnected events from the socket
   * and call connectToNewUser or remove the video as needed.
   */
  .then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", call => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream);
      console.log(userId);
    });

    socket.on("user-disconnected", userId => {
      const video = document.getElementById(userId);
      video.remove();
    });
  });

const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001"
});

myPeer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
}
