const express = require("express");
const ejs = require("ejs");
const app = express();

//cssファイルの取得
app.use("/assets", express.static("assets"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const mysql2 = require("mysql2");

const con = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "message_board",
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.post("/complete", (req, res) => {
  const { username, email, password } = req.body;
  const insertSql =
    "insert into users (username, email, password) values(?, ?, ?)";
  con.query(insertSql, [username, email, password], function (err, result) {
    if (err) throw err;
    //insert成功後、新しく挿入された行を選択
    const selectSql = "select * from users where user_id = ?";
    con.query(selectSql, [result.insertId], function (err, rows) {
      if (err) throw err;
      res.render("complete.ejs", { newUser: rows[0] });
    });
  });
});
app.get("/logout", (req, res) => {
  res.render("logout.ejs");
});
app.get("/all", (req, res) => {
  res.render("all.ejs");
});
app.get("/edit", (req, res) => {
  res.render("edit.ejs");
});
app.get("/favorite", (req, res) => {
  res.render("favorite.ejs");
});
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

//fetchAPI
app.get("/checkUsername", (req, res) => {
  const username = req.query.username;
  const sql = "select * from users";
  con.query(sql, function (err, result) {
    const usernameExists = result.find((user) => user.username === username);
    res.json({ exists: usernameExists });
  });
});
app.get("/checkEmail", (req, res) => {
  const email = req.query.email;
  const sql = "select * from users";
  con.query(sql, function (err, result) {
    const emailExists = result.find((user) => user.email === email);
    res.json({ exists: emailExists });
  });
});

app.post("/fetch_login", (req, res) => {
  const { email, password } = req.body;
  const sql = "select * from users where email = ?";
  con.query(sql, [email], function (err, result) {
    if (err) throw err;
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "指定されたメールアドレスは登録されていません" });
    }
    const user = result[0];
    if (password === user.password) {
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ error: "パスワードが正しくありません" });
    }
  });
});

app.listen(3000);
