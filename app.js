const express = require("express");
const path = require("path");
const session = require("express-session");
var cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var cors = require("cors");

var userRouter = require("./routes/user");
var flashcardsRouter = require("./routes/flashcards");

const app = express();
var corsOptions = {
  origin: "http://localhost:3001",
  allowedHeaders: ["Set-Cookie", "Content-Type"],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));
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

app.listen(2500, () => console.log("app listening on port 3000!"));
