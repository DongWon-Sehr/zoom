import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug"); // configure view engine as pug
app.set("views", __dirname + "/views"); // tell to express where is template
app.use("/public", express.static(__dirname + "/public")); // create public url for user
app.get("/", (_,res) => res.render("home")); // route handler
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening to http://localhost:3000`);

const httpServer = http.createServer(app); // create http server
const wsServer = SocketIO(httpServer);

function getPublicRooms() {
	const {
		sockets: {
			adapter: { rooms, sids }
		}
	} = wsServer;

	const publicRooms = [];
	rooms.forEach( (_, title) => {
		if ( sids.get(title) === undefined ) { // sids is Map
			const size = getRoomSize(title);
			publicRooms.push({title, size});
		}
	});

	console.log(publicRooms);

	return publicRooms;
}

function getRoomSize(roomTitle) {
	return wsServer.sockets.adapter.rooms.get(roomTitle)?.size;
}

wsServer.on("connection", socket => {

	socket["userId"] = "Anonymous";

	socket.on("join_room", (i_roomTitle, i_userId, done) => {
		socket["userId"] = i_userId; // set userId to this socket
		socket.join(i_roomTitle); // join the room
		done(i_roomTitle, getRoomSize(i_roomTitle)); // ignite startCall() function @app.js
		
		socket.to(i_roomTitle).emit("join_noti", i_userId, getRoomSize(i_roomTitle)); // notify if someone joined
		
		wsServer.sockets.emit("room_change", getPublicRooms()); // update room list
		
	});

	socket.on("offer", (i_offer, i_roomTitle) => {
		socket.to(i_roomTitle).emit("offer", i_offer);
	});

	socket.on("answer", (i_answer, i_roomTitle) => {
		socket.to(i_roomTitle).emit("answer", i_answer);
	});

	socket.on("ice", (i_ice, i_roomTitle) => {
		socket.to(i_roomTitle).emit("ice", i_ice);
	});

	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => {
			socket.to(room).emit("leave_noti", socket.userId, getRoomSize(room) - 1 );
		});
	});
	
	socket.on("disconnect", () => {
		wsServer.sockets.emit("room_change", getPublicRooms());
	});

	// socket.on("new_message", (i_msg, i_roomTitle, done) => {
	// 	socket.to(i_roomTitle).emit("new_message", `${socket.userId}: ${i_msg}`);
	// 	done();
	// });
});

httpServer.listen(3000, handleListen);