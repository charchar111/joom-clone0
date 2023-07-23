const socket = io();
const setNicknameDiv = document.getElementById("set-nickname");
const enterRoomDiv = document.getElementById("enter-room");
const chatRoomDiv = document.getElementById("chat-room");

const setNicknameForm = setNicknameDiv.querySelector("form");
const enterRoomForm = enterRoomDiv.querySelector("form");

enterRoomDiv.hidden = true;
chatRoomDiv.hidden = true;
// room.style.display = "none";

const socketInfo = {
  nickname: null,
  room: new Set(),
};

function addMessage(message) {
  console.log("새 체팅 만들기");
  const ul = chatRoomDiv.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
  return;
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = event.target.querySelector("input");
  const value = input.value;
  input.value = "";
  socket.emit("new_message", value, [...socketInfo.room], () => {
    addMessage(`You: ${value}`);
  });
}

function handleRoomSubmit(event) {
  enterRoomDiv.removeEventListener("submit", handleRoomSubmit);
  event.preventDefault();

  const input = event.target.querySelector("input");
  const value = input.value;
  input.value = "";
  socket.emit("enter_room", value, () => {
    showDiv(enterRoomDiv, chatRoomDiv);
    const roomName = chatRoomDiv.querySelector(".room-name");
    roomName.innerText = value;
    socketInfo.room.add(value);
    console.log(socketInfo);
    const msgForm = chatRoomDiv.querySelector("form.room__message");
    msgForm.addEventListener("submit", handleMessageSubmit);
  });
}

function showDiv(hideDiv, showDiv) {
  hideDiv.hidden = true;
  showDiv.hidden = false;
}

function handleNicknameSubmit(event) {
  setNicknameForm.removeEventListener("submit", handleNicknameSubmit);

  event.preventDefault();
  const input = event.target.querySelector("input");
  const value = input.value;
  input.value = "";
  socket.emit("nickname", value, () => {
    showDiv(setNicknameDiv, enterRoomDiv);
    socketInfo.nickname = value;
  });
  enterRoomDiv.addEventListener("submit", handleRoomSubmit);
}

setNicknameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (nickname, newCount) => {
  console.log("dsada");
  const roomName = chatRoomDiv.querySelector(".room-name");
  roomName.innerText = `${[...socketInfo.room][0]} : ${newCount}`;
  addMessage(`✅: ${nickname}이 입장했습니다.`);
  // console.log(`${user} 이 입장했습니다.`);
});

socket.on("bye", (nickname, newCount) => {
  const roomName = chatRoomDiv.querySelector(".room-name");
  roomName.innerText = `${[...socketInfo.room][0]} : ${newCount}`;
  addMessage(`${nickname} left`);
});

// socket.on("new_message", (msg) => {
//   addMessage(msg);
// });

socket.on("new_message", addMessage);

socket.on("announcement", addMessage);

socket.on("room_change", (rooms) => {
  console.log(rooms);
  const roomList = enterRoomDiv.querySelector("ul.room-list");
  roomList.innerHTML = "";

  rooms.forEach((element) => {
    const li = document.createElement("li");
    li.innerText = element;
    roomList.appendChild(li);
  });
});
