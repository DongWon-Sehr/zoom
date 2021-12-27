import express from "express";

const app = express();

app.set("view engine", "pug"); // configure view engine as pug
app.set("views", __dirname + "/views"); // tell to express where is template
app.use("/public", express.static(__dirname + "/public")); // create public url for user
app.get("/", (req,res) => res.render("home")); // route handler

const handleListen = () => console.log(`Listening to http://localhost:3001`);
app.listen("3001", handleListen);