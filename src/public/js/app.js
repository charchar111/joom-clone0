// const socket = new WebSocket("ws://localhost:3000");
const messageList = document.querySelector(".message-logs");
const messageForm = document.querySelector(".message-send");
const nicknameForm = document.querySelector(".nickname-send");

const frontSocket = new WebSocket(`ws://${window.location.host}`);

frontSocket.addEventListener("open", (socket) => {
  console.log("connected to server!!");
  // console.log(socket);
});

frontSocket.addEventListener("message", (message) => {
  console.log(JSON.parse(message.data));
  const data = JSON.parse(message.data);
  const li = document.createElement("li");
  li.innerText = ` ${data.nickname} : ${data.payload}`;
  // li.innerText = await socket.data.text();
  messageList.appendChild(li);
});

frontSocket.addEventListener("close", () => {
  console.log("disconnect");
});

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

async function handleSubmitNickname(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  frontSocket.send(makeMessage("nickname", input.value));
  input.value = "";
}

function handleSubmitChat(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");

  frontSocket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = ` You : ${input.value}`;
  messageList.appendChild(li);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmitChat);
nicknameForm.addEventListener("submit", handleSubmitNickname);
