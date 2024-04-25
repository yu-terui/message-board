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
app.listen(3000);
