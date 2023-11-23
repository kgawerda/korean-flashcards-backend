var express = require("express");
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app = express();

const mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "172.22.144.1",
  port: "3306",
  user: "root",
  password: "nostale12",
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
connection.query("USE korean_webapp");

router.post("/sign-up", async (req, res, next) => {
  try {
    connection.query(
      "INSERT INTO users (username, password) values ('" +
        req.body.username +
        "','" +
        req.body.password +
        "')"
    );
    res.send("user added");
  } catch (err) {
    return next(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    connection.query(
      "SELECT * FROM users WHERE username  = '" + username + "'",
      function (err, rows) {
        if (err) return done(err);
        if (!rows.length) {
          return done(null, false, req.flash("loginMessage", "No user found.")); // req.flash is the way to set flashdata using connect-flash
        }

        // if the user is found but the password is wrong
        if (!(rows[0].password == password)) {
          return done(
            null,
            false,
            req.flash("loginMessage", "Oops! Wrong password.")
          ); // create the loginMessage and save it to session as flashdata
        }
        // all is well, return successful user
        return done(null, rows[0]);
      }
    );
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function (user_id, done) {
  connection.query(
    "select * from users where user_id = " + user_id,
    function (err, rows) {
      done(err, rows[0]);
    }
  );
});

router.post("/log-in", passport.authenticate("local"), (req, res) => {
  res.send("done");
});

router.get("/profile", (req, res) => {
  res.json(req.user);
});

module.exports = router;
