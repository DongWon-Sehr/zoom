const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.querySelector("#room");
room.hidden = true;

let roomName;
let nickName;
let roomStatus;

function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
}

function handleMessageSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("#message input")
	const value = input.value;
	socket.emit("new_message", value, roomName, () => {
		addMessage(`You: ${value}`)
	});
	input.value = "";
}

function handleRoomSubmit(event) {
	event.preventDefault();
	const roomInput = welcomeForm.querySelector("#roomName");
	const nicknameInput = welcomeForm.querySelector("#nickName");
	socket.emit("enter_room", roomInput.value, nicknameInput.value, showRoom);
	roomName = roomInput.value;
	roomInput.value = nicknameInput.value = "";
}

function getRoomTitle(title, size) {
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${title} (${size})`;
}

function showRoom(title, size) {
	welcome.hidden = true;
	room.hidden = false;

	getRoomTitle(title, size);
	
	const messageForm = room.querySelector("#message");
	messageForm.addEventListener("submit", handleMessageSubmit);
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, roomSize) => {
	console.log("weclome event invoked");
	getRoomTitle(roomName, roomSize);
	addMessage(`${user} joined!`);
});

socket.on("bye", (user, roomSize) => {
	console.log("bye event invoked");
	getRoomTitle(roomName, roomSize);
	addMessage(`${user} left!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
	const roomList = welcome.querySelector("ul");
	roomList.innerText = "";
	if (rooms.length === 0) {
		roomStatus = null;
		return;
	}
	rooms.forEach(room => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${room.title}</strong> (${room.size})`;
		const btn = document.createElement("button");
		btn.innerText = "Join";
		btn.value = room;
		btn.classList.add("join");
		li.appendChild(btn);
		roomList.appendChild(li);
	});

	roomStatus = rooms;
});