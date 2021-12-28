import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug"); // configure view engine as pug
app.set("views", __dirname + "/views"); // tell to express where is template
app.use("/public", express.static(__dirname + "/public")); // create public url for user
app.get("/", (_,res) => res.render("home")); // route handler
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening to http://localhost:3001`);
// app.listen("3000", handleListen);

const server = http.createServer(app); // create http server

const wss = new WebSocket.Server({ server }); // create WebSocket server on the http server

const convertBufferToString = data => {
	const bufferOriginal = Buffer.from(data);
	const result = bufferOriginal.toString('utf8');
	return result;
};

const sockets = [];

wss.on("connection", (socket) => {
	console.log("Connected to Client ✅");
	sockets.push(socket);
	socket["nickname"] = "Anonymous";
	socket.on("close", () => console.log("Disconnected from the Client ❌"));
	socket.on("message", (message) => {
		message = convertBufferToString(message);
		message = JSON.parse(message);

		switch (message.type) {
			case "new message":
				sockets.forEach(aSocket => 
					aSocket.send(`${socket.nickname}: ${message.payload}`));
				break;
			case "nickname":
				socket["nickname"] = message.payload;
				socket.send(`Nickname saved as ${message.payload}`);
				break;
		}
	});
	socket.send("Connected to Server ✅");
});

server.listen(3001, handleListen);