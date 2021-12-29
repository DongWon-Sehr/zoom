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

const handleListen = () => console.log(`Listening to http://localhost:3001`);
// app.listen("3000", handleListen);

const httpServer = http.createServer(app); // create http server

const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
	socket.on("enter_room", (msg) => console.log(msg));
});

httpServer.listen(3001, handleListen);