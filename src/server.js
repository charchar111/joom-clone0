import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/static", express.static("src/public"));
app.get("/", (req, res) => {
  return res.render("home");
});
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (backendSocket) => {
  console.log("connected to browser!!");
  backendSocket.on("close", () => {
    console.log("disconnected from the client browser");
  });
  backendSocket.on("message", (socket) =>
    console.log(socket.toString("utf-8"))
  );
  backendSocket.send("hello!!");
});
// app.listen(PORT, () => {
//   console.log(`server listen ${PORT}`);
// });

server.listen(PORT, () => console.log(`server listen ${PORT}`));
