// const socket = new WebSocket("ws://localhost:3000");
const frontSocket = new WebSocket(`ws://${window.location.host}`);

frontSocket.addEventListener("open", (socket) => {
  console.log("connected to server!!");
  console.log(socket);
});

frontSocket.addEventListener("message", (socket) => {
  console.log("message");
  console.log(socket.data);
});

frontSocket.addEventListener("close", () => {
  console.log("disconnect");
});

setTimeout(() => {
  console.log("send message to server");
  frontSocket.send("hello from the browser!");
}, 5000);
