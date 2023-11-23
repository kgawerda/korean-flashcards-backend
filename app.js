const express = require("express");
const path = require("path");
const session = require("express-session");
var cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var userRouter = require("./routes/user");
var flashcardsRouter = require("./routes/flashcards");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRouter);
app.use("/flashcards", flashcardsRouter);

app.listen(3000, () => console.log("app listening on port 3000!"));
