const fs = require("fs");
const path = require("path");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const ejs = require("ejs");
const app = express();

//sql設定
const mysql2 = require("mysql2");
const con = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "message_board",
});
const sessionStore = new MySQLStore({}, con);

//session設定
app.use(
  session({
    secret: "my_secret", //本番ではわかりにくいキーを設定
    store: sessionStore,
    resave: false, //trueにするとsessionに変更がなくても強制保存
    saveUninitialized: false, //trueにすると初期化されてなくても保存
    cookie: { maxAge: 1000 * 60 * 60 }, //cookieの寿命 単位はミリ秒 = 1h
  })
);
app.use("/assets", express.static("assets")); //cssファイル
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//header
const headerPath = path.join(__dirname, "views", "header.ejs");
const headerTemp = fs.readFileSync(headerPath, "utf-8");
function renderHeader(currentUser) {
  return ejs.render(headerTemp, { currentUser });
}
app.use((req, res, next) => {
  //currentUserをレスポンスのローカル変数にセット
  res.locals.currentUser = req.session.currentUser;
  //ヘッダーテンプレートをレンダリングしてレスポンスのローカル変数にセット
  res.locals.header = renderHeader(req.session.currentUser);
  next();
});
//アカウント関連
//logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      // ログアウト成功時にヘッダーを再レンダリングしてクリアされた状態にする
      res.locals.header = renderHeader(null);
      res.clearCookie("connect.sid"); // クッキーをクリア
      res.render("logout.ejs");
    }
  });
});
//fetchAPI
//login
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
      //ログイン成功時にセッションにユーザー情報保存
      req.session.currentUser = user;
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ error: "パスワードが正しくありません" });
    }
  });
});
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
//ここまでfetch
//ここからルーティング
app.get("/", (req, res) => {
  res.render("index.ejs", { currentUser: req.session.currentUser });
});
app.get("/login", (req, res) => {
  res.render("login.ejs", { currentUser: req.session.currentUser });
});
app.get("/register", (req, res) => {
  res.render("register.ejs", { currentUser: req.session.currentUser });
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
      res.render("complete.ejs", {
        newUser: rows[0],
        currentUser: req.session.currentUser,
      });
    });
  });
});
app.get("/all", (req, res) => {
  res.render("all.ejs", { currentUser: req.session.currentUser });
});
app.get("/edit", (req, res) => {
  res.render("edit.ejs", { currentUser: req.session.currentUser });
});
app.get("/favorite", (req, res) => {
  res.render("favorite.ejs", { currentUser: req.session.currentUser });
});
app.get("/new", (req, res) => {
  res.render("new.ejs", { currentUser: req.session.currentUser });
});

app.listen(3000);
