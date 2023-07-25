const socket = io();

let socketInfo = {};
let myPeerConnection;
let myStream = null;

// let socketInfo = { nickname: null, room: {} };
const myStreamDiv = document.getElementById("myStream");
const video = document.getElementById("face-video");
const myVideoControll = document.getElementById("controller");
const muteBtn = myVideoControll.querySelector("#mute");
const cameraBtn = myVideoControll.querySelector("#camera");
const cameraSelect = document.getElementById("cameras");

async function startMedia() {
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
}

muteBtn.addEventListener("click", handleMuteBtn);
cameraBtn.addEventListener("click", handleCameraBtn);
cameraSelect.addEventListener("input", handleCameraSelect);

// 방 참가
const welcomeDiv = document.getElementById("welcome");
const welcomeDivForm = document.querySelector("form");

function handleWelcommSubmit(event) {
  event.preventDefault();
  const input = welcomeDivForm.querySelector("input ");

  socket.emit("join_room", input.value, startMedia);
  socketInfo.room = {};
  socketInfo.room.name = input.value;
  console.log(socketInfo.room.name);
  event.target.reset();
}
welcomeDivForm.addEventListener("submit", handleWelcommSubmit);

// 소켓 코드
socket.on("welcome", async () => {
  console.log("someone join");
  const offer = await myPeerConnection.createOffer();
  console.log(offer);
  await myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, socketInfo.room.name);
});

socket.on("offer", (offer) => {
  console.log("get offer");
  console.log(offer);
  myPeerConnection.setRemoteDescription(offer);
});

// RTC code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  console.log(myStream.getTracks());
  myStream
    .getTracks()
    .forEach((element) => myPeerConnection.addTrack(element, myStream));
}
