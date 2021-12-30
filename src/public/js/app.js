const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.querySelector("#room");
room.hidden = true;

let roomName;
let nickName;

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

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;

	const messageForm = room.querySelector("#message");
	messageForm.addEventListener("submit", handleMessageSubmit);
}




welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
	console.log("weclome event invoked");
	addMessage(`${user} joined!`);
});

socket.on("bye", (user) => {
	console.log("weclome event invoked");
	addMessage(`${user} left!`);
});

socket.on("new_message", addMessage);