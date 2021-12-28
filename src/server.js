import express from "express";
import http from "http";
import { SocketAddress } from "net";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug"); // configure view engine as pug
app.set("views", __dirname + "/views"); // tell to express where is template
app.use("/public", express.static(__dirname + "/public")); // create public url for user
app.get("/", (_,res) => res.render("home")); // route handler
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening to http://localhost:3000`);
// app.listen("3000", handleListen);

const server = http.createServer(app); // create http server

const wss = new WebSocket.Server({ server }); // create WebSocket server on the http server

const convertBufferToString = data => {
	const bufferOriginal = Buffer.from(data);
	const result = bufferOriginal.toString('utf8');
	return result;
};

wss.on("connection", (socket) => {
	console.log("Connected to Client ✅");
	socket.on("close", () => console.log("Disconnected from the Client ❌"));
	socket.on("message", (message) => console.log( convertBufferToString(message) ));
	socket.send("hello from the server!!");
});

server.listen(3000, handleListen);