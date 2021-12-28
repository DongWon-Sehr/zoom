import express from "express";
import http from "http";
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

function handleConnection(socket) {
	console.log(socket);
}

wss.on("connection", handleConnection);

server.listen(3000, handleListen);