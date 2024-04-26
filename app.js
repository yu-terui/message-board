const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static("assets"))
app.get("/", (req, res) => {
  res.render("index.ejs")
})
app.get("/login", (req, res) => {
  res.render("login.ejs")
})
app.get("/register", (req, res) => {
  res.render("register.ejs")
})
app.get("/complete", (req, res) => {
  res.render("complete.ejs")
})
app.get("/logout", (req, res) => {
  res.render("logout.ejs")
})
app.get("/all", (req, res) => {
  res.render("all.ejs")
})
app.get("/edit", (req, res) => {
  res.render("edit.ejs")
})
app.get("/favorite", (req, res) => {
  res.render("favorite.ejs")
})
app.listen(3000);
