const socket = io();

const welcome = document.querySelector("#welcome");

const welcomeForm = welcome.querySelector("form");

function handleRoomSubmit(event) {
	event.preventDefault();
	const input = welcomeForm.querySelector("input");
	socket.emit("enter_room", { palyload: input.value });
	input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);