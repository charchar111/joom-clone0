const socket = io();

let socketInfo = {};
let myPeerConnection;
let myStream = null;
let myDataChannel;

// let socketInfo = { nickname: null, room: {} };
const myStreamDiv = document.getElementById("myStream");
const video = document.getElementById("face-video");
const myVideoControll = document.getElementById("controller");
const muteBtn = myVideoControll.querySelector("#mute");
const cameraBtn = myVideoControll.querySelector("#camera");
const cameraSelect = document.getElementById("cameras");

async function initCall() {
  welcomeDiv.hidden = true;
  myStreamDiv.hidden = false;

  await getMedia();
  makeConnection();
}

async function getCamera() {
  console.log("get camera");
  const device = await navigator.mediaDevices.enumerateDevices();
  const cameras = device.filter((element) => element.kind === "videoinput");

  const currentCamera = myStream.getVideoTracks()[0].label;

  cameras.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.deviceId;
    option.innerText = element.label;
    if (currentCamera == element.label) {
      option.selected = true;
    }
    cameraSelect.appendChild(option);
  });
}

async function getMedia(deviceId) {
  const initialConstraints = { audio: true, video: true };
  const constraints = { audio: true, video: { deviceId: { exact: deviceId } } };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? constraints : initialConstraints
    );

    video.srcObject = myStream;
    if (!deviceId) {
      await getCamera();
    }
  } catch (err) {
    console.log(err);
  }
}

let muted = false;
let cameraOff = false;

function handleMuteBtn(event) {
  myStream.getAudioTracks().forEach((element) => {
    element.enabled = !element.enabled;
  });
  if (!muted) {
    event.target.innerText = "Unmute";
    muted = true;
  } else {
    event.target.innerText = "mute";
    muted = false;
  }
}

function handleCameraBtn(event) {
  myStream.getVideoTracks().forEach((element) => {
    element.enabled = !element.enabled;
  });

  if (!cameraOff) {
    event.target.innerText = "camera on";
    cameraOff = true;
  } else {
    event.target.innerText = "camera off";
    cameraOff = false;
  }
}

async function handleCameraSelect(event) {
  await getMedia(event.target.value);
  // 비디오 트랙 업데이트

  const videoTrack = myStream.getVideoTracks()[0];
  if (myPeerConnection) {
    const videoSender = myPeerConnection
      .getSenders()
      .find((element) => element.track.kind == "video");
    console.log(videoSender);
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteBtn);
cameraBtn.addEventListener("click", handleCameraBtn);
cameraSelect.addEventListener("input", handleCameraSelect);

// 방 참가
const welcomeDiv = document.getElementById("welcome");
const welcomeDivForm = document.querySelector("form");

async function handleWelcommSubmit(event) {
  event.preventDefault();
  const input = welcomeDivForm.querySelector("input ");
  await initCall();
  socket.emit("join_room", input.value);
  socketInfo.room = {};
  socketInfo.room.name = input.value;
  console.log(socketInfo.room.name);
  event.target.reset();
}
welcomeDivForm.addEventListener("submit", handleWelcommSubmit);

// 소켓 코드
socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", console.log);
  console.log("make data channel");
  const offer = await myPeerConnection.createOffer();

  await myPeerConnection.setLocalDescription(offer);
  console.log("offer send");
  socket.emit("offer", offer, socketInfo.room.name);
});

socket.on("offer", async (offer) => {
  console.log("receive offer");
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", console.log);
  });

  // console.log(offer);
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();

  myPeerConnection.setLocalDescription(answer);
  console.log("send answer");
  socket.emit("offer_answer", answer, socketInfo.room.name);
});

socket.on("offer_answer", (answer) => {
  console.log("reseive answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("iceCandidate", async (ice) => {
  console.log("reseived candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC code

function handleIce(event) {
  console.log("send candidate");
  socket.emit("iceCandidate", event.candidate, socketInfo.room.name);
}

function handleTrack(event) {
  console.log("handleTrack");
  console.log(event.streams[0]);

  const peerStreamDiv = document.getElementById("peerStream-video");
  peerStreamDiv.srcObject = event.streams[0];
}

function makeConnection() {
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  myPeerConnection = new RTCPeerConnection(configuration);
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleTrack);
  console.log(myStream.getTracks());
  myStream
    .getTracks()
    .forEach((element) => myPeerConnection.addTrack(element, myStream));
}
