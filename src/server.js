import express from "express";
import http from "http";
import SocketIO from "socket.io";
// import WebSocket from "ws";

const app = express();

app.set("view engine", "pug"); // configure view engine as pug
app.set("views", __dirname + "/views"); // tell to express where is template
app.use("/public", express.static(__dirname + "/public")); // create public url for user
app.get("/", (_,res) => res.render("home")); // route handler
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening to http://localhost:3000`);
// app.listen("3000", handleListen);

const httpServer = http.createServer(app); // create http server

const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
	socket["nickname"] = "Anonymous";
	socket.onAny((event) => {
		console.log(wsServer.sockets.adapter);
		console.log(`Socket Event: ${event}`);
	});
	socket.on("enter_room", (roomName, nickName, done) => {
		console.log(socket.rooms);
		socket["nickname"] = nickName;
		socket.join(roomName);
		done();
		console.log(`Room Name: ${roomName}`);
		socket.to(roomName).emit("welcome", socket.nickname);
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => {
			socket.to(room).emit("bye", socket.nickname);
		});
	})
	socket.on("new_message", (msg, roomName, done) => {
		socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
		done();
	});
});

httpServer.listen(3000, handleListen);